class AddSiegeTargetToServers < ActiveRecord::Migration[7.1]
  def change
    add_column :servers, :siege_target, :boolean, default: false, null: false
  end
end
