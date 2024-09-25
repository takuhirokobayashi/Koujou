class Api::V1::ServersController < ApplicationController
  before_action :set_server, only: [:show, :update, :destroy]

  def index
    @servers = Server.all.order( :code )
    render json: @servers
  end

  def show
    render json: @server
  end

  def create
    @server = Server.new( server_params )
    if @server.save
      render json: @server, status: :created
    else
      render json: { errors: @server.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @server.update( server_params )
      render json: @server, status: :ok
    else
      render json: { errors: @server.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @server.destroy
    head :no_content
  end

  private

  def set_server
    @server = Server.find_by( id: params[:id] )
    head :not_found unless @server
  end

  def server_params
    params.require( :server ).permit( :code, :name, :siege_target )
  end
end
