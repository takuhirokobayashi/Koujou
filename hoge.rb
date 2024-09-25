require 'swagger_helper'

RSpec.describe 'PowerTransitions API', type: :request do
  path '/api/v1/power_transitions' do
    get 'Retrieves all power transitions' do
      tags 'PowerTransitions'
      produces 'application/json'

      response '200', 'power transitions found' do
        schema type: :array,
          items: { '$ref' => '#/components/schemas/PowerTransition' }
        run_test!
      end
    end
  end

  path '/api/v1/servers/{server_id}/power_transitions' do
    parameter name: :server_id, in: :path, type: :string

    post 'Creates a power transition' do
      tags 'PowerTransitions'
      consumes 'application/json'
      parameter name: :power_transition, in: :body, schema: {
        '$ref' => '#/components/schemas/PowerTransitionInput'
      }

      response '201', 'power transition created' do
        schema '$ref' => '#/components/schemas/PowerTransition'
        let(:power_transition) { { total_power: 123456789, recorded_on: '2024-07-18' } }
        run_test!
      end

      response '422', 'invalid request' do
        schema '$ref' => '#/components/schemas/Error'
        let(:power_transition) { { total_power: nil, recorded_on: '2024-07-18' } }
        run_test!
      end
    end
  end

  path '/api/v1/power_transitions/{id}' do
    parameter name: :id, in: :path, type: :string

    get 'Show a power transition' do
      tags 'PowerTransitions'
      produces 'application/json'

      response '200', 'power transition found' do
        schema '$ref' => '#/components/schemas/PowerTransition'
        run_test!
      end

      response '404', 'power transition not found' do
        schema '$ref' => '#/components/schemas/Error'
        let(:id) { 'invalid' }
        run_test!
      end
    end

    patch 'Update a power transition' do
      tags 'PowerTransitions'
      consumes 'application/json'
      parameter name: :power_transition, in: :body, schema: {
        '$ref' => '#/components/schemas/PowerTransitionInput'
      }

      response '200', 'power transition updated' do
        schema '$ref' => '#/components/schemas/PowerTransition'
        let(:power_transition) { { total_power: 123456789, recorded_on: '2024-07-18' } }
        run_test!
      end

      response '422', 'invalid request' do
        schema '$ref' => '#/components/schemas/Error'
        let(:power_transition) { { total_power: nil, recorded_on: '2024-07-18' } }
        run_test!
      end

      response '404', 'power transition not found' do
        schema '$ref' => '#/components/schemas/Error'
        let(:id) { 'invalid' }
        run_test!
      end
    end

    delete 'Delete a power transition' do
      tags 'PowerTransitions'

      response '204', 'no content' do
        run_test!
      end

      response '404', 'power transition not found' do
        schema '$ref' => '#/components/schemas/Error'
        let(:id) { 'invalid' }
        run_test!
      end
    end
  end
end
