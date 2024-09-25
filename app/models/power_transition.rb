class PowerTransition < ApplicationRecord
  belongs_to :guild

  def self.create_or_update_today_status( guild_id )
    today = Date.today
    find_or_initialize_by( guild_id: guild_id, recorded_on: today )
  end

  def self.pt_max_ro_table
    pt_arel_t = self.arel_table
    return pt_arel_t.project(
      pt_arel_t[:guild_id],
      pt_arel_t[:recorded_on].maximum.as( 'max_recorded_on' )
    ).where(
      pt_arel_t[:recorded_on].lteq( Date.today )
    ).group( pt_arel_t[:guild_id] ).as( 'pt_max_ro' )
  end
end
