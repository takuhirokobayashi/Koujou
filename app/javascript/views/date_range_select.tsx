import React, { useState, useEffect, } from 'react'
import { addDays, addWeeks, format, parse, isValid, } from 'date-fns'

import { Select, } from './styles'
import { css } from '@emotion/css'

type Props = {
  target_day: null | Date,
  set_target_day: ( val: null | Date ) => void,
}

export default function DateRangeSelect( props: Props ) {
  const container_css = css( {
    display: 'flex',
    gap: '20px',
  } )
  const item_css = css( {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  } )

  const [baseDate, setBaseDate] = useState<Date>( new Date() )
  const [siegeRanges, setSiegeRanges] = useState<Array<Date>>( [] )

  useEffect(
    () => {
      const wday = baseDate.getDay()
      let start_date: Date
      if ( 1 == wday ) {
        start_date = addDays( baseDate, -6 )
      } else if ( 0 == wday ) {
        start_date = addDays( baseDate, -5 )
      } else {
        start_date = addDays( baseDate, - ( wday - 2 ) )
      }

      start_date = addWeeks( start_date, -8 )
      let ranges_buffer: Array<Date> = []
      for ( let week = 0; week < 12; week++ ) {
        ranges_buffer.push( addWeeks( start_date, week ) )
      }
      setSiegeRanges( ranges_buffer )
    }, [baseDate]
  )

  const safeDateParse = ( string_date: string, ): null | Date => {
    const parsedDate = parse( string_date, 'yyyy-MM-dd', new Date() )
    if ( ! isValid( parsedDate ) ) {
      return null
    }
    const isCorrectlyParsed = string_date === format( parsedDate, 'yyyy-MM-dd' )
    return isCorrectlyParsed ? parsedDate : null
  }

  return(
    <div>
      <div className = {container_css }>
        <div className = { item_css }>
          <div>
            { '攻城戦期間' }
          </div>
          <div>
            <Select
              onChange = {
                ( event: React.ChangeEvent<HTMLSelectElement>, ) => {
                  props.set_target_day( safeDateParse( event.target.value ) )
                }
              }
              defaultValue = { '' }
            >
              <option value = { '' }></option>
              {
                siegeRanges.map(
                  ( siege_start_day, ) => {
                    return(
                      <option
                        key = { 'siege-start-day-' + format( siege_start_day, 'yyyyMMdd' ) }
                        value = { format( siege_start_day, 'yyyy-MM-dd' ) }
                      >
                        { format( siege_start_day, 'yyyy/MM/dd' ) + '～' + format( addDays( siege_start_day, 5 ), 'yyyy/MM/dd' ) }
                      </option>
                    )
                  }
                )
              }
            </Select>
          </div>
        </div>
        <div className = { item_css }>
          <div>
            <button
              onClick= {
                ( event: React.MouseEvent<HTMLButtonElement>, ) => {
                  setBaseDate( addWeeks( baseDate, -8 ) )
                }
              }
            >
              { '▲' }
            </button>
          </div>
          <div>
            <button
              onClick= {
                ( event: React.MouseEvent<HTMLButtonElement>, ) => {
                  setBaseDate( addWeeks( baseDate, 8 ) )
                }
              }
            >
              { '▼' }
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
