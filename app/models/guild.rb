class Guild < ApplicationRecord
  belongs_to :server
  has_many :daily_points, dependent: :destroy
  has_many :power_transitions, dependent: :destroy
end
