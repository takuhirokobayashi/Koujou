class Api::V1::DailyPointsController < ApplicationController
  before_action :set_daily_point, only: [:show, :update, :destroy]
  before_action :set_guild, only: [:create]
  before_action :set_server, only: [:index]
  before_action :set_result_date, only: [:index, :index_result_siege]

  def index
    s_arel_t = Server.arel_table
    g_arel_t = Guild.arel_table
    dp_arel_t = DailyPoint.arel_table

    g_join_conds = g_arel_t.join( s_arel_t ).on( s_arel_t[:id].eq( g_arel_t[:server_id] ) ).join_sources
    dp_join_conds = dp_arel_t.join( g_arel_t ).on( g_arel_t[:id].eq( dp_arel_t[:guild_id] ) ).join_sources

    # この範囲の取り方する場合別なメンバにした方がいいかも…？
    @daily_points = DailyPoint.joins(
      dp_join_conds
    ).joins(
      g_join_conds
    ).where(
      dp_arel_t[:recorded_on].gteq( @start_date ).and( dp_arel_t[:recorded_on].lteq( @end_date ) )
    ).order( total_points: :desc )

    render json: @daily_points
  end

  def show
    render json: @daily_point
  end

  def create
    @daily_point = @guild.daily_points.new( daily_point_params )
    if @daily_point.save
      render json: @daily_point, status: :created
    else
      render json: { errors: @daily_point.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @daily_point.update( daily_point_params )
      render json: @daily_point, status: :ok
    else
      render json: { errors: @daily_point.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @daily_point.destroy
    head :no_content
  end

  def index_result_siege
    s_arel_t = Server.arel_table
    g_arel_t = Guild.arel_table
    dp_arel_t = DailyPoint.arel_table

    max_recorded_on = DailyPoint.where( recorded_on: @start_date..@end_date ).maximum( :recorded_on )

    daily_points = []
    if max_recorded_on.present?
      daily_points = DailyPoint.joins( guild: :server )
      .where( recorded_on: max_recorded_on )
      .select(
        Arel.star,
        dp_arel_t[:id].as( 'daily_point_id' ),
        g_arel_t[:name].as( 'guild_name' ),
        s_arel_t[:name].as( 'server_name' )
      )
      .order( total_points: :desc )
    end

    render json: {
      max_recorded_on: max_recorded_on,
      daily_points: daily_points
    }
  end

  def crop_recent_file
    unless params.present? and
        params[:recent_file].present? and :png == FastImage.type( params[:recent_file].path ) and
        params[:recent_x_axis].present? and params[:recent_y_axis].present?
      head :bad_request
      return
    end

    recent_file = params[:recent_file]
    recent_x_axis = params[:recent_x_axis].to_i
    recent_y_axis = params[:recent_y_axis].to_i

    recent_image = Magick::Image.read( recent_file.path ).first
    crop_recent_image = recent_image.crop(
       recent_x_axis,
       recent_y_axis,
      274,
      ( 90 * 6 )
    )
    crop_recent_image_blob = crop_recent_image.to_blob
    send_data crop_recent_image_blob, type: 'image/png', disposition: 'attachment', filename: 'cropped_recent.png'
  end

  def crop_point_file
    unless params.present? and
        params[:point_file].present? and :png == FastImage.type( params[:point_file].path ) and
        params[:point_x_axis].present? and params[:point_y_axis].present?
      head :bad_request
      return
    end

    point_file = params[:point_file]
    point_x_axis = params[:point_x_axis].to_i
    point_y_axis = params[:point_y_axis].to_i

    point_image = Magick::Image.read( point_file.path ).first
    crop_point_image = point_image.crop(
      point_x_axis,
      point_y_axis,
      700,
      ( 86 * 6 )
    )
    crop_point_image_blob = crop_point_image.to_blob
    send_data crop_point_image_blob, type: 'image/png', disposition: 'attachment', filename: 'cropped_point.png'
  end

  def upload_ocr_and_show_results
    unless params.present? and params[:server_id].present? and
        params[:recent_file].present? and :png == FastImage.type( params[:recent_file].path ) and
        params[:point_file].present? and :png == FastImage.type( params[:point_file].path ) and
        params[:recent_x_axis].present? and params[:recent_y_axis].present? and
        params[:point_x_axis].present? and params[:point_y_axis].present?
      head :bad_request
      return
    end

    server = Server.find( params[:server_id] )
    unless server.present?
      head :bad_request
      return
    end
    server_id = server.id

    recent_file = params[:recent_file]
    point_file = params[:point_file]
    recent_x_axis = params[:recent_x_axis].to_i
    recent_y_axis = params[:recent_y_axis].to_i
    point_x_axis = params[:point_x_axis].to_i
    point_y_axis = params[:point_y_axis].to_i

    recent_image = Magick::Image.read( recent_file.path ).first
    daily_points = []
    for n in 0..5
      guild_name_image = recent_image.crop(
        recent_x_axis, ( 90 * n ) + recent_y_axis, 240, 38
      )
      guild_name_image = guild_name_image.resize( 2 )
      guild_name = ''
      Tempfile.create( ['guild_name', '.png'] ) do |temp_file|
        guild_name_image.write( temp_file.path )
        guild_name_ocr = RTesseract.new( temp_file.path, lang: 'jpn' )
        guild_name = guild_name_ocr.to_s.strip
# FileUtils.cp( temp_file.path, "tmp/recent_guild_name_#{n}.png" )
      end

      yellow_city_count_image = recent_image.crop(
        52 + recent_x_axis, 38 + ( 90 * n ) + recent_y_axis, 20, 40
      )
      yellow_city_count_image = yellow_city_count_image.negate
      yellow_city_count_image = yellow_city_count_image.resize( 2 )
      yellow_city_count = ''
      Tempfile.create( ['yellow_city_count', '.png'] ) do |temp_file|
        yellow_city_count_image.write( temp_file.path )
        yellow_city_count_ocr = RTesseract.new( temp_file.path, psm: 10 )
        yellow_city_count = yellow_city_count_ocr.to_s.strip
# FileUtils.cp( temp_file.path, "tmp/yellow_city_count_#{n}.png" )
      end

      purple_city_count_image = recent_image.crop(
        148 + recent_x_axis, 38 + ( 90 * n ) + recent_y_axis, 18, 40
      )
      purple_city_count_image = purple_city_count_image.negate
      purple_city_count_image = purple_city_count_image.resize( 2 )
      purple_city_count = ''
      Tempfile.create( ['purple_city_count', '.png'] ) do |temp_file|
        purple_city_count_image.write( temp_file.path )
        purple_city_count_ocr = RTesseract.new( temp_file.path, psm: 10 )
        purple_city_count = purple_city_count_ocr.to_s.strip
# FileUtils.cp( temp_file.path, "tmp/purple_city_count_#{n}.png" )
      end

      blue_city_count_image = recent_image.crop(
        243 + recent_x_axis, 38 + ( 90 * n ) + recent_y_axis, 20, 40
      )
      blue_city_count_image = blue_city_count_image.negate
      blue_city_count_image = blue_city_count_image.resize( 2 )
      blue_city_count = ''
      Tempfile.create( ['blue_city_count', '.png'] ) do |temp_file|
        blue_city_count_image.write( temp_file.path )
        blue_city_count_ocr = RTesseract.new( temp_file.path, psm: 10 )
        blue_city_count = blue_city_count_ocr.to_s.strip
# FileUtils.cp( temp_file.path, "tmp/blue_city_count_#{n}.png" )
      end

      if guild_name.present?
        guild = Guild.where( server_id: server_id, name: guild_name ).first
        guild_id = guild.blank? ? nil : guild.id
        daily_points.push( {
          guild_id: guild_id,
          guild_name: guild_name,
          total_points: nil,
          yellow_city_count: yellow_city_count,
          purple_city_count: purple_city_count,
          blue_city_count: blue_city_count
        } )
      end
    end

    point_image = Magick::Image.read( point_file.path ).first
    for n in 0..5
      guild_name_image = point_image.crop(
        point_x_axis, ( 84 * n ) + point_y_axis + 24, 200, 44
      )
      guild_name = ''
      Tempfile.create( ['guild_name', '.png'] ) do |temp_file|
        guild_name_image.write( temp_file.path )
        guild_name_ocr = RTesseract.new( temp_file.path, lang: 'jpn' )
        guild_name = guild_name_ocr.to_s.strip
# FileUtils.cp( temp_file.path, "tmp/point_guild_name_#{n}.png" )
      end

      total_points_image = point_image.crop(
        630 + point_x_axis, ( 84 * n ) + point_y_axis + 24, 70, 44
      )
      total_points = ''
      Tempfile.create( ['total_points', '.png'] ) do |temp_file|
        total_points_image.write( temp_file.path )
        total_points_ocr = RTesseract.new( temp_file.path, psm: 10 )
        total_points = total_points_ocr.to_s.strip
# FileUtils.cp( temp_file.path, "tmp/total_points_#{n}.png" )
      end

      if guild_name.present?
        daily_point_index = daily_points.find_index{|daily_point| guild_name == daily_point[:guild_name] }
        if daily_point_index.nil? and guild_name.present?
          guild = Guild.where( server_id: server_id, name: guild_name ).first
          guild_id = guild.blank? ? nil : guild.id
          daily_points << {
            guild_id: guild_id,
            guild_name: guild_name,
            total_points: total_points,
            yellow_city_count: nil,
            purple_city_count: nil,
            blue_city_count: nil
          }
        else
          daily_points[daily_point_index][:total_points] = total_points
        end
      end
    end

    render json: daily_points
  end

  private

  def set_daily_point
    @daily_point = DailyPoint.find_by( id: params[:id] )
    head :not_found unless @daily_point
  end

  def set_guild
    @guild = Guild.find_by( id: params[:guild_id] )
    head :not_found unless @guild
  end

  def set_server
    @server = Server.find_by( id: params[:server_id] )
    head :not_found unless @server
  end

  def set_result_date
    unless params && params[:target_date]
      head :bad_request
      return
    end

    target_date = nil
    begin
      target_date = Date.parse( params[:target_date] )
    rescue
      head :bad_request
      return
    end

    @start_date = nil
    @end_date = nil
    if 1 == target_date.wday
      @start_date = target_date - 6.day
      @end_date = target_date - 1.day
    elsif 0 == target_date.wday
      @end_date = target_date
      @start_date = @end_date - 5.day
    else
      @start_date = target_date - ( target_date.wday - 2 ).day
      @end_date = @start_date + 5.day
    end
  end

  def daily_point_params
    params.require( :daily_point ).permit(
      :guild_id,
      :total_points, :yellow_city_count, :purple_city_count,
      :blue_city_count, :recorded_on
    )
  end
end
