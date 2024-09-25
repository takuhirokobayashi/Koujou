class Api::V1::GuildsController < ApplicationController
  before_action :set_guild, only: [:show, :update, :destroy]
  before_action :set_server, only: [:index, :create, :index_with_latest_power, :create_with_latest_power]

  def index
    @guilds = @server.guilds
    render json: @guilds
  end

  def show
    render json: @guild
  end

  def create
    @guild = @server.guilds.new( create_guild_params )
    if @guild.save
      render json: @guild, status: :created
    else
      render json: { errors: @guild.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @guild.update( update_guild_params )
      render json: @guild, status: :ok
    else
      render json: { errors: @guild.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @guild.destroy
    head :no_content
  end

  def index_with_latest_power
    g_arel_t = Guild.arel_table
    pt_arel_t = PowerTransition.arel_table

    pt_max_ro = PowerTransition.pt_max_ro_table

    latest_pt = pt_arel_t.project(
      pt_arel_t[:id],
      pt_arel_t[:guild_id],
      pt_arel_t[:total_power],
      pt_arel_t[:recorded_on]
    ).join(
      pt_max_ro
    ).on(
      pt_max_ro[:max_recorded_on].eq( pt_arel_t[:recorded_on] ).and(
        pt_max_ro[:guild_id].eq( pt_arel_t[:guild_id] )
      )
    ).as( 'latest_pt' )

    join_conds = g_arel_t.join( latest_pt, Arel::Nodes::OuterJoin ).on( latest_pt[:guild_id].eq( g_arel_t[:id] ) ).join_sources

    render json: @server.guilds.joins( join_conds ).select(
      g_arel_t[:id].as( 'guild_id' ),
      g_arel_t[:server_id],
      g_arel_t[:name],
      g_arel_t[:leader_name],
      latest_pt[:id].as( 'power_transition_id' ),
      latest_pt[:total_power],
      latest_pt[:recorded_on]
    )
  end

  def create_with_latest_power
    ActiveRecord::Base.transaction do
      @guild = @server.guilds.new( create_guild_params )
      if @guild.save
        @power_transition = @guild.power_transitions.new( power_transition_params )
        @power_transition.recorded_on = Date.today
        if @power_transition.save
          render json: @guild, status: :created
        else
          render json: { errors: @power_transition.errors.full_messages }, status: :unprocessable_entity
          raise ActiveRecord::Rollback
        end
      else
        render json: { errors: @guild.errors.full_messages }, status: :unprocessable_entity
      end
    end
  end

  private

  def set_guild
    @guild = Guild.find_by( id: params[:id] )
    head :not_found unless @guild
  end

  def set_server
    @server = Server.find_by( id: params[:server_id] )
    head :not_found unless @server
  end

  def create_guild_params
    params.require( :guild ).permit( :name, :leader_name )
  end

  def update_guild_params
    params.require( :guild ).permit( :server_id, :name, :leader_name )
  end

  def power_transition_params
    params.require( :power_transition ).permit( :total_power )
  end
end
