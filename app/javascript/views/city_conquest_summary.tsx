import { useState, useEffect, } from 'react'

import { ServersApi, type Server } from '../apis'

import Accodion from './accordion'
import AccodionItem from './accordion_item'
import ServerPanel from './server_panel'
import GuildPanel from './guild_panel'
import DailyPointPanel from './daily_point_panel'
import DailyPointOcrPanel from './daily_point_ocr_panel'
import RankingPanel from './ranking_panel'

export default function CityConquestSummary() {
  const serversApi = new ServersApi()

  const [errorMessages, setErrorMessages] = useState<string>( '' )
  const [servers, setServers] = useState<Array<Server>>( [] )

  useEffect(
    () => {
      fetchServers()
    }, []
  )

  const addErrorMessage = ( val: string, ) => {
    if ( '' == errorMessages ) {
      setErrorMessages( val )
    } else {
      setErrorMessages( errorMessages + "\n" + val )
    }
  }

  const fetchServers = () => {
    serversApi.apiV1ServersGet().then( response => {
      if ( 200 == response.status ) {
        setServers( response.data )
      } else {
        addErrorMessage( `Unexpected status code: ${response.status}` )
      }
    } ).catch( error=> {
      addErrorMessage( 'Error fetching servers' )
      console.error( 'Error fetching servers', error )
    } )
  }

  return(
    <Accodion>
      <div>
        <textarea disabled = { true } value = { errorMessages } />
      </div>
      <AccodionItem
        add_error_message = { addErrorMessage }
        title = { 'サーバ一覧' }
      >
        <ServerPanel
          add_error_message = { addErrorMessage }
          servers = { servers }
          set_servers = { setServers }
          fetch_servers = { fetchServers }
        />
      </AccodionItem>
      <AccodionItem
        add_error_message = { addErrorMessage }
        title = { '魂部一覧' }
      >
        <GuildPanel
          add_error_message = { addErrorMessage }
          servers = { servers }
        />
      </AccodionItem>
      <AccodionItem
        add_error_message = { addErrorMessage }
        title = { '攻城戦集計' }
      >
        <DailyPointPanel
          add_error_message = { addErrorMessage }
          servers = { servers }
        />
      </AccodionItem>
      <AccodionItem
        add_error_message = { addErrorMessage }
        title = { 'データ取込' }
      >
        <DailyPointOcrPanel
          add_error_message = { addErrorMessage }
          servers = { servers }
        />
      </AccodionItem>
      <AccodionItem
        add_error_message = { addErrorMessage }
        title = { '現状ランキング' }
      >
        <RankingPanel
          add_error_message = { addErrorMessage }
        />
      </AccodionItem>
    </Accodion>
  )
}
