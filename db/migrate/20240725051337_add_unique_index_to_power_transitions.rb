class AddUniqueIndexToPowerTransitions < ActiveRecord::Migration[7.1]
  def up
    add_index :power_transitions, [:guild_id, :recorded_on], unique: true
  end

  def down
    remove_index :power_transitions, column: [:guild_id, :recorded_on]
  end
end
