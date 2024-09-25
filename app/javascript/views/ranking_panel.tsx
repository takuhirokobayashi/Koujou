import { useState, useEffect, } from 'react'
import { format, parse, } from 'date-fns'

import {
  DailyPointsApi, type DailyPointGuildServer,
} from "../apis"
import { Table, TableRow, TableHeader, TableCell, Select, } from './styles'
import { css } from '@emotion/css'
import DateRangeSelect from './date_range_select'

type Props = {
  add_error_message: ( val: string, ) => void,
}

export default function RankingPanel( props: Props ) {
  const container_css = css( {
    display: 'flex',
    gap: '20px',
  } )
  const item_css = css( {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  } )

  const dailyPointsApi = new DailyPointsApi()

  const [siegeTargetDay, setSiegeTargetDay] = useState<null | Date>( null )
  const [dailyPoints, setDailyPoints] = useState<Array<DailyPointGuildServer>>( [] )
  const [maxRecordedOn, setMaxRecordedOn] = useState<null | Date>( null )

  useEffect(
    () => {
      if ( null === siegeTargetDay ) {
        setMaxRecordedOn( null )
        setDailyPoints( [] )
      } else {
        dailyPointsApi.apiV1DailyPointsIndexResultSiegeGet(
          format( siegeTargetDay, 'yyyy-MM-dd' )
        ).then( response => {
          if ( 200 == response.status ) {
            const max_recorded_on: null | string = response.data.max_recorded_on
            if ( null !== max_recorded_on ) {
              setMaxRecordedOn( parse( max_recorded_on, 'yyyy-MM-dd', new Date() ) )
              setDailyPoints( response.data.daily_points )
            } else {
              setMaxRecordedOn( null )
              setDailyPoints( [] )
            }
          } else {
            props.add_error_message( `Unexpected status code: ${response.status}` )
          }
        } ).catch( error=> {
          props.add_error_message( 'Error fetching ranking daily points' )
          console.error( 'Error fetching ranking daily points', error )
        } )
      }
    }, [siegeTargetDay]
  )

  return(
    <div>
      <div className = {container_css }>
        <div className = { item_css }>
          <DateRangeSelect
            target_day = { siegeTargetDay }
            set_target_day = { setSiegeTargetDay }
          />
        </div>
        <div className = { item_css }>
          <div>
            { '期間内最新日' }
          </div>
          <div>
            { null === maxRecordedOn ? '' : format( maxRecordedOn, 'yyyy/MM/dd' ) }
          </div>
        </div>
      </div>
      <div>
        <Table>
          <thead>
            <TableRow>
              <TableHeader>{ 'サーバ名' }</TableHeader>
              <TableHeader>{ 'ギルド名' }</TableHeader>
              <TableHeader>{ 'ポイント' }</TableHeader>
              <TableHeader>{ '黄都市' }</TableHeader>
              <TableHeader>{ '紫都市' }</TableHeader>
              <TableHeader>{ '青都市' }</TableHeader>
            </TableRow>
          </thead>
          <tbody>
            {
              dailyPoints.map(
                ( daily_point: DailyPointGuildServer, ) => {
                  return(
                    <TableRow
                      key = { daily_point.daily_point_id }
                    >
                      <TableCell>
                        { daily_point.server_name }
                      </TableCell>
                      <TableCell>
                        { daily_point.guild_name }
                      </TableCell>
                      <TableCell>
                        { daily_point.total_points }
                      </TableCell>
                      <TableCell>
                        { daily_point.yellow_city_count }
                      </TableCell>
                      <TableCell>
                        { daily_point.purple_city_count }
                      </TableCell>
                      <TableCell>
                        { daily_point.blue_city_count }
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
  )
}
