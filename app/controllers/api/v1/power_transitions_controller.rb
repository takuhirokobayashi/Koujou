class Api::V1::PowerTransitionsController < ApplicationController
  before_action :set_power_transition, only: [:show, :update, :destroy]
  before_action :set_guild, only: [:create, :create_or_update]

  def index
    @power_transitions = PowerTransition.all.order( total_power: :desc )
    render json: @power_transitions
  end

  def show
    render json: @power_transition
  end

  def create
    @power_transition = @guild.power_transitions.new( power_transition_params )
    if @power_transition.save
      render json: @power_transition, status: :created
    else
      render json: { errors: @power_transition.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @power_transition.update( power_transition_params )
      render json: @power_transition, status: :ok
    else
      render json: { errors: @power_transition.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @power_transition.destroy
    head :no_content
  end

  def create_or_update
    @power_transition = PowerTransition.create_or_update_today_status( @guild.id )
    @power_transition.attributes = only_total_power_params
    is_new_record = @power_transition.new_record?
    if @power_transition.save
      status = is_new_record ? :created : :ok
      render json: @power_transition, status: status
    else
      render json: { errors: @power_transition.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def set_power_transition
    @power_transition = PowerTransition.find_by( id: params[:id] )
    head :not_found unless @power_transition
  end

  def set_guild
    @guild = Guild.find_by( id: params[:guild_id] )
    head :not_found unless @guild
  end

  def power_transition_params
    params.require( :power_transition ).permit( :total_power, :recorded_on )
  end

  def only_total_power_params
    params.require( :power_transition ).permit( :total_power )
  end
end
