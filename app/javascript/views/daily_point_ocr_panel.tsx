import React, { useState, } from 'react'
import { css, } from '@emotion/css'
import { format, parse, } from 'date-fns'

import { Table, TableRow, TableHeader, TableCell, Select, } from './styles'
import {
  type Server, type Guild, type DailyPointOCR, type DailyPoint, type DailyPointInput,
  DailyPointsApi, DailyPointsApiFp, GuildsApi,
} from "../apis"
import type { RawAxiosRequestConfig, AxiosPromise, AxiosInstance, } from 'axios'

type Props = {
  add_error_message: ( val: string, ) => void,
  servers: Array<Server>,
}

export default function DailyPointOcrPanel( props: Props ) {
  type MergeDailyPoint = {
    ocr_data: DailyPointOCR,
    db_record: null | DailyPoint,
  }

  const drop_zone_css = css( {
    width: '600px',
    height: '400px',
    border: '2px dashed #ccc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '4px',
    padding: '5px',
  } )
  const image_css = css( {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  } )
  const container_css = css( {
    display: 'grid',
    gridTemplateColumns: 'repeat( 4, 1fr )',
    gridTemplateRows: 'auto auto',
    gridTemplateAreas: "'col1 col2 col3 col4'\n" +
      "'bottom-left bottom-left bottom-right bottom-right'",
    gap: '10px',
  } )
  const form_container_css = css( {
    display: 'flex',
    gap: '20px',
  } )
  const form_item_css = css( {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  } )

  const guildsApi = new GuildsApi()
  const dailyPointsApi = new DailyPointsApi()
  const dailyPointsApiFp = DailyPointsApiFp()
  const recentFilePostFp = dailyPointsApiFp.apiV1DailyPointsCropRecentFilePost
  const pointFilePostFp = dailyPointsApiFp.apiV1DailyPointsCropPointFilePost

  const [recentFile, setRecentFile] = useState<null | File>( null )
  const [pointFile, setPointFile] = useState<null | File>( null )
  const [recentSrc, setRecentSrc] = useState<null | string>( null )
  const [pointSrc, setPointSrc] = useState<null | string>( null )
  const [croppedRecentSrc, setCroppedRecentSrc] = useState<null | string>( null )
  const [croppedPointSrc, setCroppedPointSrc] = useState<null | string>( null )
  const [recentAxisX, setRecentAxisX] = useState<null | number>( null )
  const [recentAxisY, setRecentAxisY] = useState<null | number>( null )
  const [pointAxisX, setPointAxisX] = useState<null | number>( null )
  const [pointAxisY, setPointAxisY] = useState<null | number>( null )
  const [serverId, setServerId] = useState<null | number>( null )
  const [mergeDailyPoints, setMergeDailyPoints] = useState<Array<MergeDailyPoint>>( [] )
  const [guilds, setGuilds] = useState<Array<Guild>>( [] )
  const [siegeSelectTargetDay, setSiegeSelectTargetDay] = useState<Date>( new Date() )
  const [enableRecentPaste, setEnableRecentPaste] = useState<boolean>( false )
  const [enablePointPaste, setEnablePointPaste] = useState<boolean>( false )

  const handlePaste = (
    set_file: React.Dispatch<React.SetStateAction<null | File>>,
    set_src: React.Dispatch<React.SetStateAction<null | string>>,
    set_enable_paste: React.Dispatch<React.SetStateAction<boolean>>,
  ) => {
    return async ( event: React.ClipboardEvent<HTMLDivElement>, ) => {
      event.preventDefault()

      const clipboardContents = await navigator.clipboard.read()
      if ( 0 < clipboardContents.length ) {
        const item = clipboardContents[0]
        if ( item.types.includes( 'image/png' ) ) {
          const blob = await item.getType( 'image/png' )
          if ( blob ) {
            const url = URL.createObjectURL( blob )
            const file = new File( [blob], 'screenshot.png', { type: blob.type, } )
            set_file( file )
            set_src( url )
            set_enable_paste( false )
          }
        }
      }
    }
  }

  const getAxis = (
    image_src: string,
    set_axis_x: React.Dispatch<React.SetStateAction<null | number>>,
    set_axis_y: React.Dispatch<React.SetStateAction<null | number>>,
  ) => {
    return ( event: React.MouseEvent<HTMLImageElement>, ) => {
      const image = new Image()
      image.src = image_src
      const rect: DOMRect = event.currentTarget.getBoundingClientRect()
      image.onload = () => {
        set_axis_x( ( event.clientX - rect.left ) * ( image.width / rect.width ) )
        set_axis_y( ( event.clientY - rect.top ) * ( image.height / rect.height ) )
      }
    }
  }

  const cropImage = (
    upload_file: null | File,
    axis_x: null | number,
    axis_y: null | number,
    crop_api: (
      file: File, x: number, y: number, options?: RawAxiosRequestConfig,
    ) => Promise<( axios?: AxiosInstance, basePath?: string ) => AxiosPromise<File>>,
    set_src: React.Dispatch<React.SetStateAction<null | string>>,
    add_error_message: ( val: string, ) => void,
  ) => {
    return ( event: React.MouseEvent<HTMLButtonElement, MouseEvent> ) => {
      if ( null !== upload_file && null !== axis_x && null !== axis_y ) {
        crop_api(
          upload_file, axis_x, axis_y, { responseType: 'blob', },
        ).then(
          request => {
            return request()
          }
        ).then(
          response => {
          if ( 200 == response.status ) {
            const reader = new FileReader()
            reader.onload = ( event ) => {
              if ( null !== event.target ) {
                if ( typeof event.target.result === 'string' ) {
                  set_src( event.target.result )
                }
              }
            }
            reader.readAsDataURL( response.data )
          } else {
            add_error_message( `Unexpected status code: ${response.status}` )
          }
        } ).catch( error=> {
          add_error_message( 'Error crop image' )
          console.error( 'Error crop image', error )
        } )
      }
    }
  }

  const handleOcrData = ( index: number, key: keyof DailyPointOCR, ) => {
    return ( event: React.ChangeEvent<HTMLInputElement>, ) => {
      const mod_merge_daily_points = [...mergeDailyPoints]
      mod_merge_daily_points[index] = {
        ...mod_merge_daily_points[index],
        ocr_data: {
          ...mod_merge_daily_points[index].ocr_data,
          [key]: event.target.value,
        }
      }
      setMergeDailyPoints( mod_merge_daily_points )
    }
  }

  return(
    <div>
      <div className = { container_css }>
        <div className = { css( { gridArea: 'col1', } ) }>
          <div
            className = { css( [drop_zone_css, enableRecentPaste ? css( { backgroundColor: 'orange', } ) : undefined] ) }
            onClick = {
              ( event: React.MouseEvent<HTMLImageElement>, ) => {
                if ( ( ! enablePointPaste ) && null === recentSrc ) {
                  setEnableRecentPaste( ! enableRecentPaste )
                }
              }
            }
            onPaste = {
              enableRecentPaste && null === recentSrc ?
                handlePaste( setRecentFile, setRecentSrc, setEnableRecentPaste ) :
                undefined
            }
          >
            {
              null === recentSrc ?
                'ここをクリックして有効にしてから、「最新状況」のスクリーンショットを取得してペーストしてください' :
                <img
                  src = { recentSrc }
                  className = { image_css }
                  onClick = {
                    getAxis( recentSrc, setRecentAxisX, setRecentAxisY )
                  }
                />
            }
          </div>
        </div>
        <div className = { css( { gridArea: 'col2', } ) }>
          <div>
            {
              null === recentAxisX ?
                '画像をアップロード後、取り込み左上点をクリックしてください' :
                <div className = { form_container_css }>
                  <div className = { form_item_css }>
                    { 'X' }
                  </div>
                  <div className = { form_item_css }>
                    <input
                      value = { recentAxisX }
                      onChange = {
                        ( event: React.ChangeEvent<HTMLInputElement>, ) => {
                          const val = parseInt( event.target.value )
                          setRecentAxisX( isNaN( val ) ? null : val )
                        }
                      }
                    />
                  </div>
                  <div className = { form_item_css }>
                    { 'px' }
                  </div>
                </div>
            }
          </div>
          <div>
            {
              null === recentAxisY ?
                '画像をアップロード後、取り込み左上点をクリックしてください' :
                <div className = { form_container_css }>
                  <div className = { form_item_css }>
                    { 'Y' }
                  </div>
                  <div className = { form_item_css }>
                    <input
                      value = { recentAxisY }
                      onChange = {
                        ( event: React.ChangeEvent<HTMLInputElement>, ) => {
                          setRecentAxisY( parseInt( event.target.value ) )
                        }
                      }
                    />
                  </div>
                  <div className = { form_item_css }>
                    { 'px' }
                  </div>
                </div>
            }
          </div>
          <div>
            <button
              onClick = {
                cropImage(
                  recentFile, recentAxisX, recentAxisY,
                  recentFilePostFp, setCroppedRecentSrc, props.add_error_message
                )
              }
              disabled = { null === recentFile || null === recentAxisX || null === recentAxisY }
            >
              { 'Crop' }
            </button>
          </div>
          <div>
            <button
              onClick = {
                ( event: React.MouseEvent<HTMLButtonElement>, ) => {
                  setRecentSrc( null )
                  setRecentAxisX( null )
                  setRecentAxisY( null )
                  setRecentFile( null )
                  setCroppedRecentSrc( null )
                }
              }
              disabled = { null === recentFile || null === recentAxisX || null === recentAxisY }
            >
              { 'Clear' }
            </button>
          </div>
        </div>
        <div className = { css( { gridArea: 'col3', } ) }>
          <div
            className = { css( [drop_zone_css, enablePointPaste ? css( { backgroundColor: 'orange', } ) : undefined] ) }
            onClick = {
              ( event: React.MouseEvent<HTMLImageElement>, ) => {
                if ( ( ! enableRecentPaste ) && null === pointSrc ) {
                  setEnablePointPaste( ! enablePointPaste )
                }
              }
            }
            onPaste = {
              enablePointPaste && null === pointSrc ?
                handlePaste( setPointFile, setPointSrc, setEnablePointPaste ) :
                undefined
            }

          >
            {
              null === pointSrc ?
                'ここをクリックして有効にしてから、「今季順位」のスクリーンショットを取得してペーストしてください' :
                <img
                  src = { pointSrc }
                  className = { image_css }
                  onClick = {
                    getAxis( pointSrc, setPointAxisX, setPointAxisY )
                  }
                />
            }
          </div>
        </div>
        <div className = { css( { gridArea: 'col4', } ) }>
          <div>
            {
              null === pointAxisX ?
                '画像をアップロード後、取り込み左上点をクリックしてください' :
                <div className = { form_container_css }>
                  <div className = { form_item_css }>
                    { 'X' }
                  </div>
                  <div className = { form_item_css }>
                    <input
                      value = { pointAxisX }
                      onChange = {
                        ( event: React.ChangeEvent<HTMLInputElement>, ) => {
                          setPointAxisX( parseInt( event.target.value ) )
                        }
                      }
                    />
                  </div>
                  <div className = { form_item_css }>
                    { 'px' }
                  </div>
                </div>
            }
          </div>
          <div>
            {
              null === pointAxisY ?
                '画像をアップロード後、取り込み左上点をクリックしてください' :
                <div className = { form_container_css }>
                  <div className = { form_item_css }>
                    { 'Y' }
                  </div>
                  <div className = { form_item_css }>
                    <input
                      value = { pointAxisY }
                      onChange = {
                        ( event: React.ChangeEvent<HTMLInputElement>, ) => {
                          setPointAxisY( parseInt( event.target.value ) )
                        }
                      }
                    />
                  </div>
                  <div className = { form_item_css }>
                    { 'px' }
                  </div>
                </div>
            }
          </div>
          <div>
            <button
              onClick = {
                cropImage(
                  pointFile, pointAxisX, pointAxisY,
                  pointFilePostFp, setCroppedPointSrc, props.add_error_message
                )
              }
              disabled = { null === pointFile || null === pointAxisX || null === pointAxisY }
            >
              { 'Crop' }
            </button>
          </div>
          <div>
            <button
              onClick = {
                ( event: React.MouseEvent<HTMLButtonElement>, ) => {
                  setPointSrc( null )
                  setPointAxisX( null )
                  setPointAxisY( null )
                  setPointFile( null )
                  setCroppedPointSrc( null )
                }
              }
              disabled = { null === pointFile || null === pointAxisX || null === pointAxisY }
            >
              { 'Clear' }
            </button>
          </div>
        </div>
        <div className = { css( { gridArea: 'bottom-left', } ) }>
          <div>
            {
              null === croppedRecentSrc ?
                '「Crop」後の画像が表示されます' :
                <img src = { croppedRecentSrc } />
            }
          </div>
        </div>
        <div className = { css( { gridArea: 'bottom-right', } ) }>
          <div>
            {
              null === croppedPointSrc ?
                '「Crop」後の画像が表示されます' :
                <img src = { croppedPointSrc } />
            }
          </div>
        </div>
      </div>
      <div>
        <div className = { form_container_css }>
          <div className = { form_item_css }>
            <div>
              { 'サーバ' }
            </div>
            <div>
              <Select
                onChange = {
                  ( event: React.ChangeEvent<HTMLSelectElement>, ) => {
                    setMergeDailyPoints( [] )

                    const val = parseInt( event.target.value )
                    if ( isNaN( val ) ) {
                      setServerId( null )
                      setGuilds( [] )
                    } else {
                      setServerId( val )
                      guildsApi.apiV1ServersServerIdGuildsGet(
                        val.toString()
                      ).then( response => {
                        if ( 200 == response.status ) {
                          setGuilds( response.data )
                        } else {
                          props.add_error_message( `Unexpected status code: ${response.status}` )
                        }
                      } ).catch( error=> {
                        props.add_error_message( 'Error fetching guilds' )
                        console.error( 'Error fetching guilds', error )
                      } )
                    }
                  }
                }
              >
                <option></option>
                {
                  props.servers.map(
                    ( server, ) => <option
                      key = { server.id }
                      value = { server.id }
                    >
                      { server.name + ' (' + server.code + ')' }
                    </option>
                  )
                }
              </Select>
            </div>
          </div>
          <div className = { form_item_css }>
            <button
              onClick = {
                ( event: React.MouseEvent<HTMLButtonElement, MouseEvent> ) => {
                  if (
                    null !== serverId && null !== recentFile && null !== pointFile &&
                    null !== recentAxisX && null !== recentAxisY &&
                    null !== pointAxisX && null !== pointAxisY
                  ) {
                    dailyPointsApi.apiV1ServersServerIdDailyPointsUploadOcrAndShowResultsPost(
                      serverId.toString(), recentFile, pointFile,
                      recentAxisX, recentAxisY, pointAxisX, pointAxisY
                    ).then( response => {
                      if ( 200 == response.status ) {
                        let merge_daily_point_ar: Array<MergeDailyPoint> = []
                        for( const ocr_data of response.data ) {
                          merge_daily_point_ar.push( { ocr_data: ocr_data, db_record: null, } )
                        }
                        setMergeDailyPoints( merge_daily_point_ar )
                      } else {
                        props.add_error_message( `Unexpected status code: ${response.status}` )
                      }
                    } ).catch( error=> {
                      props.add_error_message( 'Error OCR' )
                      console.error( 'Error OCR', error )
                    } )
                  }
                }
              }
              disabled = {
                null === serverId || null === recentFile || null === pointFile ||
                null === recentAxisX || null === recentAxisY ||
                null === pointAxisX || null === pointAxisY ||
                null === croppedRecentSrc || null === croppedPointSrc
              }
            >
              { 'Run OCR' }
            </button>
          </div>
          <div className = { form_item_css }>
            <input
              type = { 'date' }
              value = { format( siegeSelectTargetDay, 'yyyy-MM-dd' ) }
              onChange = {
                ( event: React.ChangeEvent<HTMLInputElement>, ) => {
                  setSiegeSelectTargetDay( parse( event.target.value, 'yyyy-MM-dd', new Date() ) )
                }
              }
            />
          </div>
          <div className = { form_item_css }>
            <button
              onClick = {
                ( event: React.MouseEvent<HTMLButtonElement, MouseEvent> ) => {
                  if ( null !== serverId && 0 < mergeDailyPoints.length ) {
                    dailyPointsApi.apiV1ServersServerIdDailyPointsGet(
                      serverId.toString(), format( siegeSelectTargetDay, 'yyyy-MM-dd' )
                    ).then( response => {
                      if ( 200 == response.status ) {
                        const mod_merge_daily_points: Array<MergeDailyPoint> = mergeDailyPoints.map(
                          ( merge_value: MergeDailyPoint, ) => {
                            return( { ...merge_value, db_record: null, } )
                          }
                        )
                        for( const rec of response.data ) {
                          const daily_point: DailyPoint = rec
                          const index: number = mod_merge_daily_points.findIndex(
                            ( value: MergeDailyPoint, ) => {
                              return (
                                null !== value.ocr_data.guild_id &&
                                value.ocr_data.guild_id == daily_point.guild_id &&
                                format( siegeSelectTargetDay, 'yyyy-MM-dd' ) === daily_point.recorded_on
                              )
                            }
                          )
                          if ( -1 !== index ) {
                            mod_merge_daily_points[index] = { ...mod_merge_daily_points[index], db_record: daily_point }
                          }
                        }
                        setMergeDailyPoints( mod_merge_daily_points )
                      } else {
                        props.add_error_message( `Unexpected status code: ${response.status}` )
                      }
                    } ).catch( error=> {
                      props.add_error_message( 'Error fetching daily points' )
                      console.error( 'Error fetching daily points', error )
                    } )
                  }
                }
              }
              disabled = { null === serverId || 0 === mergeDailyPoints.length }
            >
              { 'Get Daily Point' }
            </button>
          </div>
        </div>
        <div>
          <Table>
            <thead>
              <TableRow>
                <TableHeader>{ 'ギルド名' }</TableHeader>
                <TableHeader>{ 'ポイント' }</TableHeader>
                <TableHeader>{ '黄都市の数' }</TableHeader>
                <TableHeader>{ '紫都市の数' }</TableHeader>
                <TableHeader>{ '青都市の数' }</TableHeader>
                <TableHeader></TableHeader>
              </TableRow>
            </thead>
            <tbody>
              {
                mergeDailyPoints.map(
                  ( value: MergeDailyPoint, index: number, ) => {
                    return(
                      <TableRow key = { 'row_' + index.toString() }>
                        <TableCell>
                          <div className = { form_container_css }>
                            <div className = { form_item_css }>
                              <input
                                defaultValue = { value.ocr_data.guild_name }
                                disabled = { true }
                              />
                            </div>
                            <div className = { form_item_css }>
                              <Select
                                onChange = {
                                  ( event: React.ChangeEvent<HTMLSelectElement>, ) => {
                                    const val = parseInt( event.target.value )
                                    if ( ! isNaN( val ) ) {
                                      const mod_merge_daily_points = [...mergeDailyPoints]
                                      mod_merge_daily_points[index] = {
                                        ...mod_merge_daily_points[index],
                                        ocr_data: {
                                          ...mod_merge_daily_points[index].ocr_data,
                                          guild_id: val,
                                        }
                                      }
                                      setMergeDailyPoints( mod_merge_daily_points )
                                    }
                                  }
                                }
                                defaultValue = { null === value.ocr_data.guild_id ? undefined : value.ocr_data.guild_id }
                              >
                                <option></option>
                                {
                                  guilds.map(
                                    ( guild, ) => <option
                                      key = { guild.id }
                                      value = { guild.id }
                                    >
                                      { guild.name }
                                    </option>
                                  )
                                }
                              </Select>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className = { form_container_css }>
                            <div className = { form_item_css }>
                              <input
                                value = {
                                  null === value.ocr_data.total_points ?
                                    '' : value.ocr_data.total_points
                                }
                                onChange = { handleOcrData( index, 'total_points' ) }
                              />
                            </div>
                            <div className = { form_item_css }>
                              { null === value.db_record ? '' : value.db_record.total_points }
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className = { form_container_css }>
                            <div className = { form_item_css }>
                              <input
                                value = {
                                  null === value.ocr_data.yellow_city_count ?
                                    '' : value.ocr_data.yellow_city_count
                                }
                                onChange = { handleOcrData( index, 'yellow_city_count' ) }
                              />
                            </div>
                            <div className = { form_item_css }>
                              { null === value.db_record ? '' : value.db_record.yellow_city_count }
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className = { form_container_css }>
                            <div className = { form_item_css }>
                              <input
                                value = {
                                  null === value.ocr_data.purple_city_count ?
                                    '' : value.ocr_data.purple_city_count
                                }
                                onChange = { handleOcrData( index, 'purple_city_count' ) }
                              />
                            </div>
                            <div className = { form_item_css }>
                              { null === value.db_record ? '' : value.db_record.purple_city_count }
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className = { form_container_css }>
                            <div className = { form_item_css }>
                              <input
                                value = {
                                  null === value.ocr_data.blue_city_count ?
                                    '' : value.ocr_data.blue_city_count
                                }
                                onChange = { handleOcrData( index, 'blue_city_count' ) }
                              />
                            </div>
                            <div className = { form_item_css }>
                              { null === value.db_record ? '' : value.db_record.blue_city_count }
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <button
                            onClick = {
                              ( event: React.MouseEvent<HTMLButtonElement, MouseEvent> ) => {
                                if ( null !== value.ocr_data.guild_id ) {
                                  const daily_point_input: DailyPointInput = {
                                    guild_id: value.ocr_data.guild_id,
                                    recorded_on: format( siegeSelectTargetDay, 'yyyy-MM-dd' ),
                                    total_points: null === value.ocr_data.total_points ? 0 : value.ocr_data.total_points,
                                    yellow_city_count: null === value.ocr_data.yellow_city_count ? 0 : value.ocr_data.yellow_city_count,
                                    purple_city_count: null === value.ocr_data.purple_city_count ? 0 : value.ocr_data.purple_city_count,
                                    blue_city_count: null === value.ocr_data.blue_city_count ? 0 : value.ocr_data.blue_city_count,
                                  }
                                  if ( null === value.db_record ) {
                                    dailyPointsApi.apiV1GuildsGuildIdDailyPointsPost(
                                      value.ocr_data.guild_id.toString(), daily_point_input,
                                    ).then( response => {
                                      if ( 201 == response.status ) {
                                        const mod_merge_daily_points = [...mergeDailyPoints]
                                        mod_merge_daily_points[index] = { ...mod_merge_daily_points[index], db_record: response.data }
                                        setMergeDailyPoints( mod_merge_daily_points )
                                      } else {
                                        props.add_error_message( `Unexpected status code: ${response.status}` )
                                      }
                                    } ).catch( error=> {
                                      props.add_error_message( 'Error post daily points' )
                                      console.error( 'Error post daily points', error )
                                    } )
                                  } else {
                                    dailyPointsApi.apiV1DailyPointsIdPatch(
                                      value.db_record.id.toString(), daily_point_input,
                                    ).then( response => {
                                      if ( 200 == response.status ) {
                                        const mod_merge_daily_points = [...mergeDailyPoints]
                                        mod_merge_daily_points[index] = { ...mod_merge_daily_points[index], db_record: response.data }
                                        setMergeDailyPoints( mod_merge_daily_points )
                                      } else {
                                        props.add_error_message( `Unexpected status code: ${response.status}` )
                                      }
                                    } ).catch( error=> {
                                      props.add_error_message( 'Error patch daily points' )
                                      console.error( 'Error patch daily points', error )
                                    } )
                                  }
                                }
                              }
                            }
                            disabled = { null === value.ocr_data.guild_id }
                          >
                            { null === value.db_record ? '追加' : '変更' }
                          </button>
                        </TableCell>
                      </TableRow>
                    )
                  }
                )
              }
            </tbody>
          </Table>
        </div>
      </div>
    </div>
  )
}
