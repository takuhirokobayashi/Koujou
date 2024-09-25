class CreateDailyPoints < ActiveRecord::Migration[7.1]
  def change
    create_table :daily_points do |t|
      t.references :guild, null: false, foreign_key: true
      t.integer :total_points
      t.integer :yellow_city_count
      t.integer :purple_city_count
      t.integer :blue_city_count
      t.date :recorded_on

      t.timestamps
    end
  end
end
