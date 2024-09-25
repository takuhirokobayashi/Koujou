import { useState, useEffect, } from 'react'

import { ServersApi, type Server, type ServerInput, } from '../apis'
import { Table, TableRow, TableHeader, TableCell, Input, Button, } from './styles'

type Props = {
  add_error_message: ( val: string, ) => void,
  servers: Array<Server>,
  set_servers: ( val: Array<Server>, ) => void,
  fetch_servers: () => void,
}

export default function ServerPanel( props: Props ) {
  type ServerInputStatus = { [key: number]: ServerInput, }

  const serversApi = new ServersApi()

  const [serverInput, setServerInput] = useState<ServerInput>( { code: '', name: '', siege_target: false, } )
  const [editServerInputData, setEditServerInputData] = useState<ServerInputStatus>( {} )
  const [editingServerId, setEditingServerId] = useState<null | number>( null )

  useEffect(
    () => {
      let server_input_buf: ServerInputStatus = {}
      for ( const server of props.servers ) {
        server_input_buf[server.id] = { code: server.code, name: server.name, siege_target: server.siege_target, }
      }
      setEditServerInputData( server_input_buf )
    }, [props.servers]
  )

  const createServer = () => {
    serversApi.apiV1ServersPost( serverInput ).then( response => {
      if ( 201 == response.status ) {
        setServerInput( { code: '', name: '', siege_target: false, } )
        props.fetch_servers()
      } else if ( 422 == response.status ) {
        if ( Array.isArray( response.data ) ) {
          for ( const error of response.data ) {
            props.add_error_message( error )
          }
        }
      } else {
        props.add_error_message( `Unexpected status code: ${response.status}` )
      }
    } ).catch( error=> {
      props.add_error_message( 'Error create server' )
      console.error( 'Error create server', error )
    } )
  }

  const updateServer = ( serverId: number, ) => {
    serversApi.apiV1ServersIdPatch( serverId.toString(), editServerInputData[serverId] ).then( response => {
      if ( 200 == response.status ) {
        setEditingServerId( null )
        props.fetch_servers()
      } else if ( 422 == response.status ) {
        if ( Array.isArray( response.data ) ) {
          for ( const error of response.data ) {
            props.add_error_message( error )
          }
        }
      } else {
        props.add_error_message( `Unexpected status code: ${response.status}` )
      }
    } ).catch( error=> {
      props.add_error_message( 'Error update server' )
      console.error( 'Error update server', error )
    } )
  }

  return(
    <div>
      <Table>
        <thead>
          <TableRow>
            <TableHeader>{ 'サーバコード' }</TableHeader>
            <TableHeader>{ 'サーバ名' }</TableHeader>
            <TableHeader>{ '魂域集計対象' }</TableHeader>
            <TableHeader></TableHeader>
          </TableRow>
        </thead>
        <tbody>
          {
            props.servers.map(
              ( server, ) => {
                return(
                  <TableRow
                    key={ server.id }
                    onClick = { () => { setEditingServerId( server.id ) } }
                  >
                    <TableCell>
                      {
                        server.id === editingServerId ? (
                          <Input
                            onChange = { e => {
                              setEditServerInputData( {
                                ...editServerInputData,
                                [server.id]: { ...editServerInputData[server.id], code: e.target.value, },
                              } )
                            } }
                            value = { editServerInputData[server.id].code }
                          />
                        ) : server.code
                      }
                    </TableCell>
                    <TableCell>
                      {
                        server.id === editingServerId ? (
                          <Input
                            onChange = { e => {
                              setEditServerInputData( {
                                ...editServerInputData,
                                [server.id]: { ...editServerInputData[server.id], name: e.target.value, },
                              } )
                            } }
                            value = { editServerInputData[server.id].name }
                          />
                        ) : server.name
                      }
                    </TableCell>
                    <TableCell>
                      {
                        server.id === editingServerId ? (
                          <input
                            type = { 'checkbox' }
                            onChange = {
                              e => {
                                setEditServerInputData( {
                                  ...editServerInputData,
                                  [server.id]: { ...editServerInputData[server.id], siege_target: ( ! editServerInputData[server.id].siege_target ), },
                                } )
                              }
                            }
                            checked = { editServerInputData[server.id].siege_target }
                          />
                        ) : ( server.siege_target ? '対象' : '対象外' )
                      }
                    </TableCell>
                    <TableCell>
                      {
                        server.id === editingServerId ?
                          <Button onClick = { () => updateServer( server.id ) }>{ '変更' }</Button> :
                          ''
                      }
                    </TableCell>
                  </TableRow>
                )
              }
            )
          }
        </tbody>
        <tfoot>
          <TableRow>
            <TableHeader>
              <Input
                onChange = { e => {
                  setServerInput( { ...serverInput, code: e.target.value, } )
                } }
                value = { serverInput.code }
              />
            </TableHeader>
            <TableHeader>
              <Input
                onChange = { e => {
                  setServerInput( { ...serverInput, name: e.target.value, } )
                } }
                value = { serverInput.name }
              />
            </TableHeader>
            <TableHeader>
              <input
                type = { 'checkbox' }
                onChange = { e => { setServerInput( { ...serverInput, siege_target: ( ! serverInput.siege_target ), } ) } }
                checked = { serverInput.siege_target }
              />
            </TableHeader>
            <TableHeader>
              <Button onClick = { createServer }>{ '追加' }</Button>
            </TableHeader>
          </TableRow>
        </tfoot>
      </Table>
    </div>
  )
}
