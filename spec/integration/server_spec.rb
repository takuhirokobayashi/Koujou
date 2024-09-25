require 'swagger_helper'

RSpec.describe 'Servers API', type: :request do
  path '/api/v1/servers' do
    get 'Retrieves all servers' do
      tags 'Servers'
      produces 'application/json'

      response '200', 'servers found' do
        schema type: :array,
          items: { '$ref' => '#/components/schemas/Server' }
        run_test!
      end
    end

    post 'Creates a server' do
      tags 'Servers'
      consumes 'application/json'
      parameter name: :server, in: :body, schema: {
        '$ref' => '#/components/schemas/ServerInput'
      }

      response '201', 'server created' do
        schema '$ref' => '#/components/schemas/Server'
        let( :server ) { { name: 'S22', code: '砂海艦隊' } }
        run_test!
      end

      response '422', 'invalid request' do
        schema '$ref' => '#/components/schemas/Error'
        let( :server ) { { errors: ['Name can\'t be blank'] } }
        run_test!
      end
    end
  end

  path '/api/v1/servers/{id}' do
    parameter name: :id, in: :path, type: :string

    get 'Show a server' do
      tags 'Servers'
      produces 'application/json'

      response '200', 'server found' do
        schema '$ref' => '#/components/schemas/Server'
        run_test!
      end

      response '404', 'server not found' do
        schema '$ref' => '#/components/schemas/Error'
        let( :id ) { 'invalid' }
        run_test!
      end
    end

    patch 'Update a server' do
      tags 'Servers'
      consumes 'application/json'

      parameter name: :server, in: :body, schema: {
        '$ref' => '#/components/schemas/ServerInput'
      }

      response '200', 'server updated' do
        schema '$ref' => '#/components/schemas/Server'
        let( :server ) { { name: 'S22', code: '砂海艦隊' } }
        run_test!
      end

      response '422', 'invalid request' do
        schema '$ref' => '#/components/schemas/Error'
        let( :server ) { { errors: ['Name can\'t be blank'] } }
        run_test!
      end

      response '404', 'server not found' do
        schema '$ref' => '#/components/schemas/Error'
        let( :id ) { 'invalid' }
        run_test!
      end
    end

    delete 'Delete a server' do
      tags 'Servers'

      response '204', 'no content' do
        run_test!
      end

      response '404', 'server not found' do
        schema '$ref' => '#/components/schemas/Error'
        let( :id ) { 'invalid' }
        run_test!
      end
    end
  end
end
