require 'swagger_helper'

RSpec.describe 'Guilds API', type: :request do
  path '/api/v1/servers/{server_id}/guilds' do
    parameter name: :server_id, in: :path, type: :string

    get 'Retrieves all guilds' do
      tags 'Guilds'
      produces 'application/json'

      response '200', 'guilds found' do
        schema type: :array,
          items: { '$ref' => '#/components/schemas/Guild' }
        run_test!
      end
    end

    post 'Creates a guild' do
      tags 'Guilds'
      consumes 'application/json'
      parameter name: :guild, in: :body, schema: {
        '$ref' => '#/components/schemas/GuildInputCreate'
      }

      response '201', 'guild created' do
        schema '$ref' => '#/components/schemas/Guild'
        let( :guild ) { { name: 'うみねこ', leader_name: 'ぺちゃπ' } }
        run_test!
      end

      response '422', 'invalid request' do
        schema '$ref' => '#/components/schemas/Error'
        let( :guild ) { { errors: ['Name can\'t be blank'] } }
        run_test!
      end
    end
  end

  path '/api/v1/guilds/{id}' do
    parameter name: :id, in: :path, type: :string

    get 'Show a guild' do
      tags 'Guilds'
      produces 'application/json'

      response '200', 'guild found' do
        schema '$ref' => '#/components/schemas/Guild'
        run_test!
      end

      response '404', 'guild not found' do
        schema '$ref' => '#/components/schemas/Error'
        let( :id ) { 'invalid' }
        run_test!
      end
    end

    patch 'Update a guild' do
      tags 'Guilds'
      consumes 'application/json'

      parameter name: :guild, in: :body, schema: {
        '$ref' => '#/components/schemas/GuildInputUpdate'
      }

      response '200', 'guild updated' do
        schema '$ref' => '#/components/schemas/Guild'
        let( :guild ) { { name: 'うみねこ', leader_name: 'ぺちゃπ' } }
        run_test!
      end

      response '422', 'invalid request' do
        schema '$ref' => '#/components/schemas/Error'
        let( :guild ) { { errors: ['Name can\'t be blank'] } }
        run_test!
      end

      response '404', 'guild not found' do
        schema '$ref' => '#/components/schemas/Error'
        let( :id ) { 'invalid' }
        run_test!
      end
    end

    delete 'Delete a guild' do
      tags 'Guilds'

      response '204', 'no content' do
        run_test!
      end

      response '404', 'guild not found' do
        schema '$ref' => '#/components/schemas/Error'
        let( :id ) { 'invalid' }
        run_test!
      end
    end
  end

  path '/api/v1/servers/{server_id}/guilds/index_with_latest_power' do
    parameter name: :server_id, in: :path, type: :string

    get 'Retrieves all guilds with latest power' do
      tags 'Guilds'
      produces 'application/json'

      response '200', 'guilds found' do
        schema type: :array,
          items: { '$ref' => '#/components/schemas/GuildWithLatestPower' }
        run_test!
      end
    end
  end

  path '/api/v1/servers/{server_id}/guilds/create_with_latest_power' do
    parameter name: :server_id, in: :path, type: :string

    post 'Creates a guild with latest power' do
      tags 'Guilds'
      consumes 'application/json'
      parameter name: :guild, in: :body, schema: {
        '$ref' => '#/components/schemas/GuildInputWithLatestPower'
      }

      response '201', 'guild created' do
        schema '$ref' => '#/components/schemas/Guild'
        let( :guild ) { { name: 'うみねこ', leader_name: 'ぺちゃπ' } }
        run_test!
      end

      response '422', 'invalid request' do
        schema '$ref' => '#/components/schemas/Error'
        let( :guild ) { { errors: ['Name can\'t be blank'] } }
        run_test!
      end
    end
  end
end
