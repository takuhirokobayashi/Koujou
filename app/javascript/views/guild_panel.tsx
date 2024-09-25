import { useState, useEffect, } from 'react'
import type { AxiosResponse } from 'axios'

import {
  type Server,
  GuildsApi, type GuildWithLatestPower,
  type GuildInputUpdate, type GuildInputWithLatestPower,
  PowerTransitionsApi, type PowerTransitionOnlyTotalPowerInput,
  type GuildInputWithLatestPowerGuild,
} from "../apis"
import { Table, TableRow, TableHeader, TableCell, Select, Input, Button, } from './styles'

type Props = {
  add_error_message: ( val: string, ) => void,
  servers: Array<Server>,
}

export default function GuildPanel( props: Props ) {
  type GuildInputStatus = { [key: number]: GuildInputWithLatestPower, }

  const guildsApi = new GuildsApi()
  const powerTransitionsApi = new PowerTransitionsApi()

  const [guildInput, setGuildInput] = useState<GuildInputWithLatestPower>(
    {
      guild: { server_id: null, name: '', leader_name: '', },
      power_transition: { total_power: null, },
    }
  )
  const [serverId, setServerId] = useState<null | number>( null )
  const [guilds, setGuilds] = useState<Array<GuildWithLatestPower>>( [] )
  const [editingGuildId, setEditingGuildId] = useState<null | number>( null )
  const [editGuildInputData, setEditGuildInputData] = useState<GuildInputStatus>( {} )

  useEffect(
    () => {
      fetchGuilds()
    }, [serverId]
  )

  const fetchGuilds = () => {
    if ( null !== serverId ) {
      guildsApi.apiV1ServersServerIdGuildsIndexWithLatestPowerGet( serverId.toString() ).then( response => {
        if ( 200 == response.status ) {
          setGuilds( response.data )
          if ( Array.isArray( response.data ) ) {
            let guild_input_buf: GuildInputStatus = {}
            for ( const guild of response.data ) {
              guild_input_buf[guild.guild_id] = {
                guild: {
                  server_id: serverId,
                  name: guild.name, leader_name: guild.leader_name,
                },
                power_transition: {
                  total_power: guild.total_power,
                },
              }
            }
            setEditGuildInputData( guild_input_buf )
          }
        } else {
          props.add_error_message( `Unexpected status code: ${response.status}` )
        }
      } ).catch( error=> {
        props.add_error_message( 'Error fetching servers' )
        console.error( 'Error fetching servers', error )
      } )
    } else {
      setGuilds( [] )
      setEditGuildInputData( [] )
    }
  }

  const createGuild = () => {
    if ( null !== serverId ) {
      guildsApi.apiV1ServersServerIdGuildsCreateWithLatestPowerPost(
        serverId.toString(), guildInput
      ).then( response => {
        if ( 201 == response.status ) {
          setGuildInput( {
            guild: { server_id: null, name: '', leader_name: '', },
            power_transition: { total_power: null, },
          } )
          fetchGuilds()
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
        props.add_error_message( 'Error create guild' )
        console.error( 'Error create guild', error )
      } )
    }
  }

  const updateGuild = ( guildId: number, ) => {
    let requests: Array<Promise<AxiosResponse<void, any>>> = []
    const guild_input_last_power: undefined | GuildInputWithLatestPower = editGuildInputData[guildId]

    if ( undefined !== guild_input_last_power && null !== serverId ) {
      const guild: GuildInputWithLatestPowerGuild = guild_input_last_power.guild
      const guildInputBuffer: GuildInputUpdate = {
        server_id: null !== guild.server_id ? guild.server_id : serverId,
        name: guild.name,
        leader_name: guild.leader_name,
      }
      requests.push( guildsApi.apiV1GuildsIdPatch( guildId.toString(), guildInputBuffer ) )
  
      if ( null !== editGuildInputData[guildId].power_transition.total_power ) {
        const powerTransitionInput: PowerTransitionOnlyTotalPowerInput = {
          total_power: editGuildInputData[guildId].power_transition.total_power,
        }
        requests.push( powerTransitionsApi.apiV1GuildsGuildIdPowerTransitionsCreateOrUpdatePatch(
          guildId.toString(), powerTransitionInput
        ) )
      }
  
      Promise.all( requests ).then( responses => {
        const allSuccess = responses.every( response => 200 === response.status || 201 === response.status )
        if ( allSuccess ) {
          setEditingGuildId( null )
          fetchGuilds()
        } else {
          responses.forEach(
            response => {
              if ( 200 != response.status && 201 !== response.status ) {
                if ( 422 == response.status ) {
                  if ( Array.isArray( response.data ) ) {
                    for ( const error of response.data ) {
                      props.add_error_message( error )
                    }
                  }
                } else {
                  props.add_error_message( `Unexpected status code: ${response.status}` )
                }
              }
            }
          )
        }
      } ).catch( error=> {
        props.add_error_message( 'Error update guild' )
        console.error( 'Error update guild', error )
      } )
    }
  }

  return(
    <div>
      { 'サーバ:' }
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
      <Table>
        <thead>
          <TableRow>
            <TableHeader>{ 'ギルド名' }</TableHeader>
            <TableHeader>{ 'ギルドリーダー名' }</TableHeader>
            <TableHeader>{ '総合戦力値' }</TableHeader>
            <TableHeader></TableHeader>
            <TableHeader></TableHeader>
          </TableRow>
        </thead>
        <tbody>
          {
            guilds.map(
              ( guild, ) => {
                return(
                  <TableRow
                    key={ guild.guild_id }
                    onClick = { () => { setEditingGuildId( guild.guild_id ) } }
                  >
                    <TableCell>
                      {
                        guild.guild_id === editingGuildId ? (
                          <Input
                            onChange = {
                              e => {
                                setEditGuildInputData( {
                                  ...editGuildInputData,
                                  [guild.guild_id]: {
                                    ...editGuildInputData[guild.guild_id],
                                    guild: { ...editGuildInputData[guild.guild_id].guild, name: e.target.value },
                                  },
                                } )
                              }
                            }
                            value = { editGuildInputData[guild.guild_id].guild.name }
                          />
                        ) : guild.name
                      }
                    </TableCell>
                    <TableCell>
                      {
                        guild.guild_id === editingGuildId ? (
                          <Input
                            onChange = {
                              e => {
                                setEditGuildInputData( {
                                  ...editGuildInputData,
                                  [guild.guild_id]: {
                                    ...editGuildInputData[guild.guild_id],
                                    guild: { ...editGuildInputData[guild.guild_id].guild, leader_name: e.target.value },
                                  },
                                } )
                              }
                            }
                            value = { editGuildInputData[guild.guild_id].guild.leader_name }
                          />
                        ) : guild.leader_name
                      }
                    </TableCell>
                    <TableCell>
                      {
                        guild.guild_id === editingGuildId ? (
                          <Input
                            onChange = {
                              e => {
                                const val = parseInt( e.target.value )
                                setEditGuildInputData( {
                                  ...editGuildInputData,
                                  [guild.guild_id]: {
                                    ...editGuildInputData[guild.guild_id],
                                    power_transition: { ...editGuildInputData[guild.guild_id].guild, total_power: isNaN( val ) ? null : val },
                                  },
                                } )
                              }
                            }
                            value = {
                              editGuildInputData[guild.guild_id]?.power_transition.total_power?.toString() || ''
                            }
                          />
                        ) : guild.total_power
                      }
                    </TableCell>
                    <TableCell>
                      <Select
                        onChange = {
                          ( event ) => {
                            const val = parseInt( event.target.value )
                            if ( ! isNaN( val ) ) {
                              setEditGuildInputData( {
                                ...editGuildInputData,
                                [guild.guild_id]: {
                                  ...editGuildInputData[guild.guild_id],
                                  guild: { ...editGuildInputData[guild.guild_id].guild, server_id: val },
                                },
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
                    </TableCell>
                    <TableCell>
                      {
                        guild.guild_id === editingGuildId ? (
                          <Button onClick = { () => updateGuild( guild.guild_id ) }>{ '変更' }</Button>
                        ) : ''
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
                  setGuildInput( { ...guildInput, guild: { ...guildInput.guild, name: e.target.value, } } )
                } }
                value = { guildInput.guild.name }
              />
            </TableHeader>
            <TableHeader>
              <Input
                onChange = { e => {
                  setGuildInput( { ...guildInput, guild: { ...guildInput.guild, leader_name: e.target.value, } } )
                } }
                value = { guildInput.guild.leader_name }
              />
            </TableHeader>
            <TableHeader>
              <Input
                onChange = {
                  e => {
                    const val = parseInt( e.target.value )
                    setGuildInput( { ...guildInput, power_transition: { ...guildInput.power_transition, total_power: isNaN( val ) ? null : val, } } )
                  }
                }
                value = {
                  guildInput.power_transition.total_power?.toString() || ''
                }
              />
            </TableHeader>
            <TableHeader>
              <Button onClick = { createGuild } disabled = { null === serverId }>{ '追加' }</Button>
            </TableHeader>
          </TableRow>
        </tfoot>
      </Table>
    </div>
  )
}
