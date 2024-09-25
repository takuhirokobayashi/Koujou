Rails.application.routes.draw do
  # get 'home/index'
  get "up" => "rails/health#show", as: :rails_health_check

  root 'home#index'

  mount Rswag::Ui::Engine => '/api-docs'
  mount Rswag::Api::Engine => '/api-docs'
  namespace :api do
    namespace :v1 do
      resources :servers, only: [:index, :create, :show, :update, :destroy] do
        resources :guilds, only: [:index, :create] do
          collection do
            get :index_with_latest_power
            post :create_with_latest_power
          end
        end
        resources :daily_points, only: [:index] do
          collection do
            post :upload_ocr_and_show_results
          end
        end
      end
      resources :guilds, only: [:show, :update, :destroy] do
        resources :daily_points, only: [:create]
        resources :power_transitions, only: [:create] do
          collection do
            patch :create_or_update
          end
        end
      end
      resources :daily_points, only: [:show, :update, :destroy] do
        collection do
          get :index_result_siege
          post :crop_recent_file
          post :crop_point_file
        end
      end
      resources :power_transitions, only: [:index, :show, :update, :destroy]
    end
  end
end
