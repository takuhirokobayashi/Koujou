require 'swagger_helper'

RSpec.describe 'DailyPoints API', type: :request do
  path '/api/v1/servers/{server_id}/daily_points' do
    parameter name: :server_id, in: :path, type: :string

    get 'Retrieves all daily points' do
      tags 'DailyPoints'
      produces 'application/json'
      parameter name: :target_date, in: :query, type: :string, required: true

      response '200', 'daily points found' do
        schema type: :array,
          items: { '$ref' => '#/components/schemas/DailyPoint' }
        run_test!
      end
    end
  end

  path '/api/v1/guilds/{guild_id}/daily_points' do
    parameter name: :guild_id, in: :path, type: :string

    post 'Creates a daily point' do
      tags 'DailyPoints'
      consumes 'application/json'
      produces 'application/json'

      parameter name: :daily_point, in: :body, schema: {
        '$ref' => '#/components/schemas/DailyPointInput'
      }

      response '201', 'daily point created' do
        schema '$ref' => '#/components/schemas/DailyPoint'
        # let( :guild_id ) { '1' }
        # let( :daily_point ) { {
        #   id: '1',
        #   guild_id: '1',
        #   total_points: '1',
        #   yellow_city_count: '1',
        #   purple_city_count: '1',
        #   blue_city_count: '1',
        #   recorded_on: '2024-07-18',
        #   created_at: '2024-07-18T12:34:56Z',
        #   updated_at: '2024-07-18T12:34:56Z'
        # } }
        run_test!
      end

      response '422', 'invalid request' do
        schema '$ref' => '#/components/schemas/Error'
        let( :daily_point ) { { errors: ['Total Points can\'t be blank'] } }
        run_test!
      end
    end
  end

  path '/api/v1/daily_points/{id}' do
    parameter name: :id, in: :path, type: :string

    get 'Show a daily point' do
      tags 'DailyPoints'
      produces 'application/json'

      response '200', 'daily point found' do
        schema '$ref' => '#/components/schemas/DailyPoint'
        run_test!
      end

      response '404', 'daily point not found' do
        schema '$ref' => '#/components/schemas/Error'
        let( :id ) { 'invalid' }
        run_test!
      end
    end

    patch 'Update a daily point' do
      tags 'DailyPoints'
      consumes 'application/json'
      produces 'application/json'

      parameter name: :daily_point, in: :body, schema: {
        '$ref' => '#/components/schemas/DailyPointInput'
      }

      response '200', 'daily point updated' do
        schema '$ref' => '#/components/schemas/DailyPoint'
        let( :daily_point ) { { total_power: '123456789', recorded_on: '2024-07-18' } }
        run_test!
      end

      response '422', 'invalid request' do
        schema '$ref' => '#/components/schemas/Error'
        let( :daily_point ) { { errors: ['Total Points can\'t be blank'] } }
        run_test!
      end

      response '404', 'daily point not found' do
        schema '$ref' => '#/components/schemas/Error'
        let( :id ) { 'invalid' }
        run_test!
      end
    end

    delete 'Delete a daily point' do
      tags 'DailyPoints'

      response '204', 'no content' do
        run_test!
      end

      response '404', 'daily point not found' do
        schema '$ref' => '#/components/schemas/Error'
        let( :id ) { 'invalid' }
        run_test!
      end
    end
  end

  path '/api/v1/daily_points/crop_recent_file' do
    post 'Crop Recent file' do
      tags 'DailyPoints'
      consumes 'multipart/form-data'
      produces 'application/octet-stream'

      parameter in: :formData, schema: {
        type: :object,
        properties: {
          recent_file: { type: :string, format: :binary },
          recent_x_axis: { type: :integer },
          recent_y_axis: { type: :integer },
        },
        required: ['recent_file', 'recent_x_axis', 'recent_y_axis']
      }

      response '200', 'Success download' do
        schema type: :string, format: :binary
        # header 'Content-Disposition', description: '添付ファイル; filename="cropped_recent.png"'

        # after do |example|
        #   example.metadata[:response][:content] = {
        #     'application/octet-stream' => {
        #       example: Base64.encode64( File.open('spec/fixtures/files/test_image.png').read )
        #     }
        #   }
        # end

        run_test!
      end

      response '400', 'Bad Request' do
        let( :invalid_params ) { {} }
        run_test! do |response|
          expect( response ).to have_http_status( 400 )
        end
      end
    end
  end

  path '/api/v1/daily_points/crop_point_file' do
    post 'Crop Point file' do
      tags 'DailyPoints'
      consumes 'multipart/form-data'
      produces 'application/octet-stream'

      parameter in: :formData, schema: {
        type: :object,
        properties: {
          point_file: { type: :string, format: :binary },
          point_x_axis: { type: :integer },
          point_y_axis: { type: :integer },
        },
        required: ['point_file', 'point_x_axis', 'point_y_axis']
      }

      response '200', 'Success download' do
        schema type: :string, format: :binary
        # header 'Content-Disposition', description: '添付ファイル; filename="cropped_point.png"'

        # after do |example|
        #   example.metadata[:response][:content] = {
        #     'application/octet-stream' => {
        #       example: Base64.encode64( File.open('spec/fixtures/files/test_image.png').read )
        #     }
        #   }
        # end

        run_test!
      end

      response '400', 'Bad Request' do
        let( :invalid_params ) { {} }
        run_test! do |response|
          expect( response ).to have_http_status( 400 )
        end
      end
    end
  end

  path '/api/v1/servers/{server_id}/daily_points/upload_ocr_and_show_results' do
    parameter name: :server_id, in: :path, type: :string

    post 'Show OCR results' do
      tags 'DailyPoints'
      consumes 'multipart/form-data'
      produces 'application/json'

      parameter in: :formData, schema: {
        type: :object,
        properties: {
          recent_file: { type: :string, format: :binary },
          point_file: { type: :string, format: :binary },
          recent_x_axis: { type: :integer },
          recent_y_axis: { type: :integer },
          point_x_axis: { type: :integer },
          point_y_axis: { type: :integer },
        },
        required: [
          'recent_file', 'point_file',
          'recent_x_axis', 'recent_y_axis',
          'point_x_axis', 'point_y_axis'
        ]
      }

      response '200', 'show OCR results' do
        schema type: :array,
          items: { '$ref' => '#/components/schemas/DailyPointOCR' }
        run_test!
      end

      response '400', 'Bad Request' do
        let( :invalid_params ) { {} }
        run_test! do |response|
          expect( response ).to have_http_status( 400 )
        end
      end
    end
  end

  path '/api/v1/daily_points/index_result_siege' do
    parameter name: :target_date, in: :query, type: :string, required: true

    get 'Show Weekly daily point results' do
      tags 'DailyPoints'
      produces 'application/json'
  
      response '200', 'siege results found' do
        schema type: :object,
        properties: {
          max_recorded_on: { type: :string, format: 'date', nullable: true },
          daily_points: {
            type: :array,
            items: { '$ref' => '#/components/schemas/DailyPointGuildServer' }
          }
        },
        required: [
          'max_recorded_on', 'daily_points'
        ]
        run_test!
      end
    end
  end
end
