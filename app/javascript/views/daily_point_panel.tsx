import { useState, useEffect, } from 'react'
import { addDays, format, } from 'date-fns'

import {
  type Server,
  GuildsApi, type Guild,
  DailyPointsApi, type DailyPoint,
} from "../apis"
import { Table, TableRow, TableHeader, TableCell, Select, } from './styles'
import DailyPointCell, { type DailyPointStatus, } from './daily_point_cell'
import DateRangeSelect from './date_range_select'
import { css } from '@emotion/css'

type Props = {
  add_error_message: ( val: string, ) => void,
  servers: Array<Server>,
}

export default function DailyPointPanel( props: Props ) {
  const container_css = css( {
    display: 'flex',
    gap: '20px',
  } )
  const item_css = css( {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  } )

  const guildsApi = new GuildsApi()
  const dailyPointsApi = new DailyPointsApi()

  const [serverId, setServerId] = useState<null | number>( null )
  const [guilds, setGuilds] = useState<Array<Guild>>( [] )
  const [siegeTargetDay, setSiegeTargetDay] = useState<null | Date>( null )
  const [siegeInputRanges, setSiegeInputRanges] = useState<Array<Date>>( [] )
  const [dailyPointInput, setDailyPointInput] = useState<DailyPointStatus>( {} )

  useEffect(
    () => {
      fetchGuilds()
    }, [serverId]
  )

  useEffect(
    () => {
      let input_ranges: Array<Date> = []
      if ( null === siegeTargetDay ) {
        setSiegeInputRanges( [] )
      } else {
        input_ranges = [
          siegeTargetDay,
          addDays( siegeTargetDay, 1 ),
          addDays( siegeTargetDay, 2 ),
          addDays( siegeTargetDay, 3 ),
          addDays( siegeTargetDay, 4 ),
          addDays( siegeTargetDay, 5 ),
        ]
        setSiegeInputRanges( input_ranges )
      }

      if ( null !== serverId && null !== siegeTargetDay ) {
        dailyPointsApi.apiV1ServersServerIdDailyPointsGet(
          serverId.toString(), format( siegeTargetDay, 'yyyyMMdd' )
        ).then( response => {
          if ( 200 == response.status ) {
            const daily_points: Array<DailyPoint> = response.data
            const guild_ids = guilds.map( ( guild: Guild, ) => guild.id )
            let daily_point_input_buffer: DailyPointStatus = {}

            for ( const input_day of input_ranges ) {
              for ( const guild_id of guild_ids ) {
                const daily_point: undefined | DailyPoint = daily_points.find(
                  ( val: DailyPoint, ) => {
                  return( format( input_day, 'yyyy-MM-dd' ) == val.recorded_on && guild_id == val.guild_id )
                } )

                const key: string = `${guild_id}-${format( input_day, 'yyyyMMdd' )}`
                if ( undefined === daily_point ) {
                  daily_point_input_buffer[key] = {
                    daily_point_id: null,
                    daily_point_input: {
                      guild_id: guild_id,
                      total_points: 0,
                      yellow_city_count: 0,
                      purple_city_count: 0,
                      blue_city_count: 0,
                      recorded_on: format( input_day, 'yyyy-MM-dd' ),
                    },
                  }
                } else {
                  daily_point_input_buffer[key] = {
                    daily_point_id: daily_point.id,
                    daily_point_input: {
                      guild_id: daily_point.guild_id,
                      total_points: daily_point.total_points,
                      yellow_city_count: daily_point.yellow_city_count,
                      purple_city_count: daily_point.purple_city_count,
                      blue_city_count: daily_point.blue_city_count,
                      recorded_on: daily_point.recorded_on,
                    },
                  }
                }
              }
            }

            setDailyPointInput( daily_point_input_buffer )
          } else {
            props.add_error_message( `Unexpected status code: ${response.status}` )
          }
        } ).catch( error=> {
          props.add_error_message( 'Error fetching daily points' )
          console.error( 'Error fetching daily points', error )
        } )
      } else {
        setDailyPointInput( {} )
      }
    }, [siegeTargetDay]
  )

  const fetchGuilds = () => {
    if ( null !== serverId ) {
      guildsApi.apiV1ServersServerIdGuildsGet( serverId.toString() ).then( response => {
        if ( 200 == response.status ) {
          setGuilds( response.data )
        } else {
          props.add_error_message( `Unexpected status code: ${response.status}` )
        }
      } ).catch( error=> {
        props.add_error_message( 'Error fetching servers' )
        console.error( 'Error fetching servers', error )
      } )
    } else {
      setGuilds( [] )
    }
  }

  return(
    <div>
      <div className = {container_css }>
        <div className = { item_css }>
          <div>
            { 'サーバ' }
          </div>
          <div>
            <Select
              onChange = {
                ( event ) => {
                  const val = parseInt( event.target.value )
                  setServerId( isNaN( val ) ? null : val )
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
        <div className = { item_css }>
          <DateRangeSelect
            target_day = { siegeTargetDay }
            set_target_day = { setSiegeTargetDay }
          />
        </div>
      </div>
      <div>
        <Table>
          <thead>
            <TableRow>
              <TableHeader>{ 'ギルド名' }</TableHeader>
              {
                siegeInputRanges.map(
                  ( siege_day: Date, ) => {
                    return(
                      <TableHeader key = { 'siege-day-' + format( siege_day, 'yyyyMMdd' ) }>
                        { format( siege_day, 'yyyy/MM/dd (eee)' ) }
                      </TableHeader>
                    )
                  }
                )
              }
            </TableRow>
          </thead>
          <tbody>
            {
              guilds.map(
                ( guild, ) => {
                  return(
                    <TableRow
                      key={ guild.id }
                    >
                      <TableCell>
                        { guild.name }
                      </TableCell>
                      {
                        siegeInputRanges.map(
                          ( siege_day, ) => {
                            return(
                              <TableCell key = { `guild-siege-day-${guild.id}-` + format( siege_day, 'yyyyMMdd' ) }>
                                <DailyPointCell
                                  add_error_message = { props.add_error_message }
                                  daily_point_status = { dailyPointInput }
                                  set_daily_point_status = { setDailyPointInput }
                                  guild_id = { guild.id }
                                  siege_day = { siege_day }
                                />
                              </TableCell>
                            )
                          }
                        )
                      }
                    </TableRow>
                  )
                }
              )
            }
          </tbody>
        </Table>
      </div>
    </div>
  )
}
