import { css, } from '@emotion/css'
import { format, } from 'date-fns'

import {
  DailyPointsApi, type DailyPointInput,
} from "../apis"
import { Button, DivTable, DivTableRow, DivTableCell } from './styles'
import type { CSSInterpolation } from '@emotion/css/create-instance'
import type React from 'react'

export interface DailyPointData {
  daily_point_id: null | number,
  daily_point_input: DailyPointInput,
}

export interface DailyPointStatus {
  [key: string]: DailyPointData,
}

type Props = {
  add_error_message: ( val: string, ) => void,
  daily_point_status: DailyPointStatus,
  set_daily_point_status: ( val: DailyPointStatus ) => void,
  guild_id: number,
  siege_day: Date,
}

export default function DailyPointCell( props: Props ) {
  const inputPointStyle: CSSInterpolation = css( {
    padding: '5px',
    fontSize: 'inherit',
    border: 'none',
    backgroundColor: 'transparent',
    textAlign: 'right',
  } )

  const dailyPointsApi = new DailyPointsApi()

  const dp_status_key = (): string => {
    return( `${props.guild_id}-${format( props.siege_day, 'yyyyMMdd' )}` )
  }

  const create_or_update = () => {
    const key: string = dp_status_key()
    const daily_point_data: undefined | DailyPointData = props.daily_point_status[key]
    if ( undefined !== daily_point_data ) {
      if ( null === daily_point_data.daily_point_id ) {
        dailyPointsApi.apiV1GuildsGuildIdDailyPointsPost(
          props.guild_id.toString(), daily_point_data.daily_point_input
        ).then( response => {
          if ( 201 == response.status ) {
          } else {
            props.add_error_message( `Unexpected status code: ${response.status}` )
          }
        } ).catch( error=> {
          props.add_error_message( 'Error create daily point' )
          console.error( 'Error create daily poin', error )
        } )
      } else {
        dailyPointsApi.apiV1DailyPointsIdPatch(
          daily_point_data.daily_point_id.toString(), daily_point_data.daily_point_input
        ).then( response => {
          if ( 200 == response.status ) {
          } else {
            props.add_error_message( `Unexpected status code: ${response.status}` )
          }
        } ).catch( error=> {
          props.add_error_message( 'Error create daily point' )
          console.error( 'Error create daily poin', error )
        } )
      }
    }
  }

  const deleteDailyPoint = ( event: React.MouseEvent<HTMLButtonElement>, ) => {
    const daily_point_data: undefined | DailyPointData = props.daily_point_status[dp_status_key()]
    if (
      undefined !== daily_point_data && null !== daily_point_data.daily_point_id
    ) {
      dailyPointsApi.apiV1DailyPointsIdDelete(
        daily_point_data.daily_point_id.toString()
      ).then( response => {
        if ( 204 == response.status ) {
          const key = dp_status_key()
          props.set_daily_point_status( {
            ...props.daily_point_status,
            [key]: {
              daily_point_id: null,
              daily_point_input: {
                ...props.daily_point_status[key].daily_point_input,
                total_points: 0,
                yellow_city_count: 0,
                purple_city_count: 0,
                blue_city_count: 0,
              },
            }
        } )
        } else {
          props.add_error_message( `Unexpected status code: ${response.status}` )
        }
      } ).catch( error=> {
        props.add_error_message( 'Error delete daily point' )
        console.error( 'Error delete daily poin', error )
      } )
    }
  }

  return(
    <div>
      {
        undefined === props.daily_point_status[dp_status_key()] ? null : (
          <DivTable>
            <DivTableRow>
              <DivTableCell
                align = { 'left' }
              >
                { '累計ポイント' }
              </DivTableCell>
              <DivTableCell>
                <input
                  className = { inputPointStyle }
                  maxLength = { 2 }
                  size = { 3 }
                  value = {
                    null === props.daily_point_status[dp_status_key()].daily_point_input.total_points ?
                    0 : props.daily_point_status[dp_status_key()].daily_point_input.total_points
                  }
                  onChange = {
                    e => {
                      const key: string = dp_status_key()
                      const val = parseInt( e.target.value )

                      props.set_daily_point_status( {
                        ...props.daily_point_status,
                        [key]: {
                          ...props.daily_point_status[key],
                          daily_point_input: {
                            ...props.daily_point_status[key].daily_point_input,
                            total_points: isNaN( val ) ? 0 : val,
                          }
                        }
                      } )
                    }
                  }
                />
              </DivTableCell>
            </DivTableRow>
            <DivTableRow>
              <DivTableCell
                align = { 'left' }
              >
                { '黄色都市の数' }
              </DivTableCell>
              <DivTableCell>
                <input
                  className = { inputPointStyle }
                  maxLength = { 2 }
                  size = { 3 }
                  value = {
                    null === props.daily_point_status[dp_status_key()].daily_point_input.yellow_city_count ?
                    0 : props.daily_point_status[dp_status_key()].daily_point_input.yellow_city_count
                  }
                  onChange = {
                    e => {
                      const key: string = dp_status_key()
                      const val = parseInt( e.target.value )

                      props.set_daily_point_status( {
                        ...props.daily_point_status,
                        [key]: {
                          ...props.daily_point_status[key],
                          daily_point_input: {
                            ...props.daily_point_status[key].daily_point_input,
                            yellow_city_count: isNaN( val ) ? 0 : val,
                          }
                        }
                      } )
                    }
                  }
                />
              </DivTableCell>
            </DivTableRow>
            <DivTableRow>
              <DivTableCell
                align = 'left'
              >
                { '紫都市の数' }
              </DivTableCell>
              <DivTableCell>
                <input
                  className = { inputPointStyle }
                  maxLength = { 2 }
                  size = { 3 }
                  value = {
                    null === props.daily_point_status[dp_status_key()].daily_point_input.purple_city_count ?
                    0 : props.daily_point_status[dp_status_key()].daily_point_input.purple_city_count
                  }
                  onChange = {
                    e => {
                      const key: string = dp_status_key()
                      const val = parseInt( e.target.value )

                      props.set_daily_point_status( {
                        ...props.daily_point_status,
                        [key]: {
                          ...props.daily_point_status[key],
                          daily_point_input: {
                            ...props.daily_point_status[key].daily_point_input,
                            purple_city_count: isNaN( val ) ? 0 : val,
                          }
                        }
                      } )
                    }
                  }
                />
              </DivTableCell>
            </DivTableRow>
            <DivTableRow>
              <DivTableCell
                align = 'left'
              >
                { '青都市の数' }
              </DivTableCell>
              <DivTableCell>
                <input
                  className = { inputPointStyle }
                  maxLength = { 2 }
                  size = { 3 }
                  value = {
                    null === props.daily_point_status[dp_status_key()].daily_point_input.blue_city_count ?
                    0 : props.daily_point_status[dp_status_key()].daily_point_input.blue_city_count
                  }
                  onChange = {
                    e => {
                      const key: string = dp_status_key()
                      const val = parseInt( e.target.value )

                      props.set_daily_point_status( {
                        ...props.daily_point_status,
                        [key]: {
                          ...props.daily_point_status[key],
                          daily_point_input: {
                            ...props.daily_point_status[key].daily_point_input,
                            blue_city_count: isNaN( val ) ? 0 : val,
                          }
                        }
                      } )
                    }
                  }
                />
              </DivTableCell>
            </DivTableRow>
            <DivTableRow>
              <DivTableCell
                align = 'left'
              >
                { '現在の得点' }
              </DivTableCell>
              <DivTableCell
                align = 'right'
              >
                {
                  (
                    null === props.daily_point_status[dp_status_key()].daily_point_input.total_points ?
                    0 : props.daily_point_status[dp_status_key()].daily_point_input.total_points
                  ) +
                  (
                    null === props.daily_point_status[dp_status_key()].daily_point_input.yellow_city_count ?
                    0 : props.daily_point_status[dp_status_key()].daily_point_input.yellow_city_count * 3
                  ) +
                  (
                    null === props.daily_point_status[dp_status_key()].daily_point_input.purple_city_count ?
                    0 : props.daily_point_status[dp_status_key()].daily_point_input.purple_city_count * 2
                  ) +
                  (
                    null === props.daily_point_status[dp_status_key()].daily_point_input.blue_city_count ?
                    0 : props.daily_point_status[dp_status_key()].daily_point_input.blue_city_count
                  )
                }
              </DivTableCell>
            </DivTableRow>
            <DivTableRow>
              <DivTableCell>
                <Button onClick = { create_or_update }>{ '更新' }</Button>
              </DivTableCell>
              <DivTableCell>
                <Button
                  onClick = { deleteDailyPoint }
                  disabled = { null === props.daily_point_status[dp_status_key()].daily_point_id }
                >
                    { '削除' }
                </Button>
              </DivTableCell>
            </DivTableRow>
          </DivTable>
        )
      }
    </div>
  )
}
