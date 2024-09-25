# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.1].define(version: 2024_07_30_052504) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "daily_points", force: :cascade do |t|
    t.bigint "guild_id", null: false
    t.integer "total_points"
    t.integer "yellow_city_count"
    t.integer "purple_city_count"
    t.integer "blue_city_count"
    t.date "recorded_on"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["guild_id"], name: "index_daily_points_on_guild_id"
  end

  create_table "guilds", force: :cascade do |t|
    t.bigint "server_id", null: false
    t.string "name"
    t.string "leader_name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["server_id"], name: "index_guilds_on_server_id"
  end

  create_table "power_transitions", force: :cascade do |t|
    t.bigint "guild_id", null: false
    t.integer "total_power"
    t.date "recorded_on"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["guild_id", "recorded_on"], name: "index_power_transitions_on_guild_id_and_recorded_on", unique: true
    t.index ["guild_id"], name: "index_power_transitions_on_guild_id"
  end

  create_table "servers", force: :cascade do |t|
    t.string "code"
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "siege_target", default: false, null: false
  end

  add_foreign_key "daily_points", "guilds"
  add_foreign_key "guilds", "servers"
  add_foreign_key "power_transitions", "guilds"
end
