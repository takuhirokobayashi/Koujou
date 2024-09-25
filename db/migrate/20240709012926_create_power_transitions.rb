class CreatePowerTransitions < ActiveRecord::Migration[7.1]
  def change
    create_table :power_transitions do |t|
      t.references :guild, null: false, foreign_key: true
      t.integer :total_power
      t.date :recorded_on

      t.timestamps
    end
  end
end
