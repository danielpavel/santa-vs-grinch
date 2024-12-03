use anchor_lang::prelude::*;

use crate::errors::SantaVsGrinchErrorCode;
use crate::state::Config;

pub fn assert_game_is_active(config: &Account<Config>) -> Result<()> {
    require!(!config.game_ended, SantaVsGrinchErrorCode::GameEnded);
    require!(
        //TODO: hard code the 26th of December!
        Clock::get()?.unix_timestamp <= config.initialized_at + 86400 * 26, // December 26th
        SantaVsGrinchErrorCode::GameEnded
    );

    Ok(())
}

pub fn calculate_admin_fee(amount: u64, percentage_bp: u16) -> u64 {
    ((amount as u128 * percentage_bp as u128) / 10_000u128) as u64
}
