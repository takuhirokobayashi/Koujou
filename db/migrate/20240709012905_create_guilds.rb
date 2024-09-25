class CreateGuilds < ActiveRecord::Migration[7.1]
  def change
    create_table :guilds do |t|
      t.references :server, null: false, foreign_key: true
      t.string :name
      t.string :leader_name

      t.timestamps
    end
  end
end
