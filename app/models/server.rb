class Server < ApplicationRecord
  has_many :guilds, dependent: :destroy
end
