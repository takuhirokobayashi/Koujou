# frozen_string_literal: true

require 'rails_helper'

RSpec.configure do |config|
  # Specify a root folder where Swagger JSON files are generated
  # NOTE: If you're using the rswag-api to serve API descriptions, you'll need
  # to ensure that it's configured to serve Swagger from the same folder
  config.openapi_root = Rails.root.join('swagger').to_s

  openapi_host = ENV['OPEN_API_OBJECT_HOST'] || 'localhost'
  openapi_port = ENV['OPEN_API_OBJECT_PORT'] || '3000'
  openapi_url = "http://#{openapi_host}:#{openapi_port}"

  # Define one or more Swagger documents and provide global metadata for each one
  # When you run the 'rswag:specs:swaggerize' rake task, the complete Swagger will
  # be generated at the provided relative path under openapi_root
  # By default, the operations defined in spec files are added to the first
  # document below. You can override this behavior by adding a openapi_spec tag to the
  # the root example_group in your specs, e.g. describe '...', openapi_spec: 'v2/swagger.json'
  config.openapi_specs = {
    'v1/swagger.yaml' => {
      openapi: '3.0.1',
      info: {
        title: 'API V1',
        version: 'v1'
      },
      paths: {},
      servers: [
        {
          url: openapi_url,
          description: 'Local server'
        },
        {
          url: 'https://{defaultHost}',
          variables: {
            defaultHost: {
              default: 'www.example.com'
            }
          }
        }
      ],
      components: {
        schemas: {
          Server: {
            type: :object,
            properties: {
              id: { type: :integer },
              name: { type: :string },
              code: { type: :string },
              siege_target: { type: :boolean },
              created_at: { type: :string, format: 'date-time' },
              updated_at: { type: :string, format: 'date-time' }
            },
            required: ['id', 'name', 'code', 'siege_target', 'created_at', 'updated_at']
          },
          ServerInput: {
            type: :object,
            properties: {
              name: { type: :string },
              code: { type: :string },
              siege_target: { type: :boolean },
            },
            required: ['name', 'code', 'siege_target']
          },
          Guild: {
            type: :object,
            properties: {
              id: { type: :integer },
              name: { type: :string },
              leader_name: { type: :string },
              created_at: { type: :string, format: 'date-time' },
              updated_at: { type: :string, format: 'date-time' }
            },
            required: ['id', 'name', 'leader_name', 'created_at', 'updated_at']
          },
          GuildInputCreate: {
            type: :object,
            properties: {
              name: { type: :string },
              leader_name: { type: :string }
            },
            required: ['name', 'leader_name']
          },
          GuildInputUpdate: {
            type: :object,
            properties: {
              server_id: { type: :integer },
              name: { type: :string },
              leader_name: { type: :string }
            },
            required: ['server_id', 'name', 'leader_name']
          },
          GuildWithLatestPower: {
            type: :object,
            properties: {
              guild_id: { type: :integer },
              name: { type: :string },
              leader_name: { type: :string },
              total_power: { type: :integer, nullable: true },
              recorded_on: { type: :string, format: 'date', nullable: true },
            },
            required: ['guild_id', 'name', 'leader_name', 'total_power', 'recorded_on']
          },
          GuildInputWithLatestPower: {
            type: :object,
            properties: {
              guild: {
                type: :object,
                properties: {
                  server_id: { type: :integer, nullable: true },
                  name: { type: :string },
                  leader_name: { type: :string },
                },
                required: ['server_id', 'name', 'leader_name']
              },
              power_transition: {
                type: :object,
                properties: {
                  total_power: { type: :integer, nullable: true },
                },
                required: ['total_power']
              },
            },
            required: ['guild', 'power_transition']
          },
          PowerTransition: {
            type: :object,
            properties: {
              id: { type: :integer },
              total_power: { type: :integer },
              recorded_on: { type: :string, format: 'date' },
              created_at: { type: :string, format: 'date-time' },
              updated_at: { type: :string, format: 'date-time' }
            },
            required: ['id', 'total_power', 'recorded_on', 'created_at', 'updated_at']
          },
          PowerTransitionInput: {
            type: :object,
            properties: {
              total_power: { type: :integer },
              recorded_on: { type: :string, format: 'date' }
            },
            required: ['total_power', 'recorded_on']
          },
          PowerTransitionOnlyTotalPowerInput: {
            type: :object,
            properties: {
              total_power: { type: :integer },
            },
            required: ['total_power']
          },
          DailyPoint: {
            type: :object,
            properties: {
              id: { type: :integer },
              guild_id: { type: :integer },
              total_points: { type: :integer },
              yellow_city_count: { type: :integer },
              purple_city_count: { type: :integer },
              blue_city_count: { type: :integer },
              recorded_on: { type: :string, format: 'date' },
              created_at: { type: :string, format: 'date-time' },
              updated_at: { type: :string, format: 'date-time' }
            },
            required: [
              'id', 'guild_id', 'total_points', 'yellow_city_count', 'purple_city_count', 'blue_city_count',
              'recorded_on', 'created_at', 'updated_at'
            ]
          },
          DailyPointInput: {
            type: :object,
            properties: {
              guild_id: { type: :integer },
              total_points: { type: :integer },
              yellow_city_count: { type: :integer },
              purple_city_count: { type: :integer },
              blue_city_count: { type: :integer },
              recorded_on: { type: :string, format: 'date' }
            },
            required: [
              'guild_id', 'total_points', 'yellow_city_count', 'purple_city_count',
              'blue_city_count', 'recorded_on'
            ]
          },
          DailyPointOCR: {
            type: :object,
            properties: {
              guild_id: { type: :integer, nullable: true },
              guild_name: { type: :string },
              total_points: { type: :integer, nullable: true },
              yellow_city_count: { type: :integer, nullable: true },
              purple_city_count: { type: :integer, nullable: true },
              blue_city_count: { type: :integer, nullable: true }
            },
            required: [
              'guild_id', 'guild_name', 'total_points',
              'yellow_city_count', 'purple_city_count', 'blue_city_count'
            ]
          },
          DailyPointGuildServer: {
            type: :object,
            properties: {
              daily_point_id: { type: :integer },
              total_points: { type: :integer },
              yellow_city_count: { type: :integer },
              purple_city_count: { type: :integer },
              blue_city_count: { type: :integer },
              recorded_on: { type: :string, format: 'date' },
              guild_name: { type: :string },
              server_name: { type: :string },
            },
            required: [
              'daily_point_id', 'total_points', 'yellow_city_count', 'purple_city_count', 'blue_city_count',
              'recorded_on', 'guild_name', 'server_name'
            ]
          },
          Error: {
            type: :object,
            properties: {
              errors: {
                type: :array,
                items: { type: :string }
              }
            },
            required: ['errors']
          }
        }
      }
    }
  }

  # Specify the format of the output Swagger file when running 'rswag:specs:swaggerize'.
  # The openapi_specs configuration option has the filename including format in
  # the key, this may want to be changed to avoid putting yaml in json files.
  # Defaults to json. Accepts ':json' and ':yaml'.
  config.openapi_format = :yaml
end
