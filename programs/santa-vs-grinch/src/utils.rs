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

pub fn calculate_final_pots(
    santa_pot: u64,
    grinch_pot: u64,
    santa_boxes: u64,
    grinch_boxes: u64,
) -> Result<(u64, u64)> {
    let box_diff = if santa_boxes >= grinch_boxes {
        santa_boxes.checked_sub(grinch_boxes).unwrap()
    } else {
        grinch_boxes.checked_sub(santa_boxes).unwrap()
    };

    // Calculate multiplier: 1 + (diff * diff * 0.00005)
    let multiplier = 1_000_000 + // Base multiplier of 1 (in millionths)
        ((box_diff as u128 * box_diff as u128 * 50)) as u64;

    // Apply multiplier to the side with more boxes
    if santa_boxes > grinch_boxes {
        Ok((
            (santa_pot as u128 * multiplier as u128 / 1_000_000) as u64,
            grinch_pot,
        ))
    } else if grinch_boxes > santa_boxes {
        Ok((
            santa_pot,
            (grinch_pot as u128 * multiplier as u128 / 1_000_000) as u64,
        ))
    } else {
        Ok((santa_pot, grinch_pot))
    }
}
