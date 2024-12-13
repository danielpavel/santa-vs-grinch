use anchor_lang::prelude::*;

use crate::constants::{GRINCH_BET_TAG, SANTA_BET_TAG};
use crate::errors::SantaVsGrinchErrorCode;
use crate::state::{BettingSide, Config};

pub fn assert_game_is_active(config: &Account<Config>) -> Result<()> {
    require!(!config.game_ended, SantaVsGrinchErrorCode::GameEnded);
    require!(
        //TODO: hard code the 26th of December!
        Clock::get()?.unix_timestamp <= config.initialized_at + 86400 * 26, // December 26th
        SantaVsGrinchErrorCode::GameEnded
    );

    Ok(())
}

pub fn assert_bet_tag(bet_tag: &String) -> Result<()> {
    require!(
        bet_tag.eq(SANTA_BET_TAG) || bet_tag.eq(GRINCH_BET_TAG),
        SantaVsGrinchErrorCode::InvalidBetTag
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

pub fn calculate_winnings(bet_amount: u64, bet_side: BettingSide, config: &Config) -> Result<u64> {
    match config.winning_side {
        Some(winning_side) => {
            if winning_side == bet_side {
                // Calculate winner's share of the losing pot
                let (winning_pot, losing_pot) = match winning_side {
                    BettingSide::Santa => (config.santa_pot, config.grinch_pot),
                    BettingSide::Grinch => (config.grinch_pot, config.santa_pot),
                };

                // Calculate the share of the losing pot (75% to winners)
                let losing_pot_share = (losing_pot as u128 * 75) / 100;

                // Calculate individual winner's share based on their contribution to winning pot
                let winner_share = (bet_amount as u128 * losing_pot_share) / winning_pot as u128;

                // Return original bet plus winnings
                Ok(bet_amount
                    .checked_add(winner_share as u64)
                    .ok_or(ProgramError::ArithmeticOverflow)?)
            } else {
                // Losing side gets nothing
                Ok(0)
            }
        }
        None => {
            // In case of a true tie, return 87.5% of original bet (12.5% penalty)
            Ok((bet_amount as u128 * 875 / 1000) as u64)
        }
    }
}

pub fn calculate_creators_winnings(vault_amount: u64, config: &Config) -> Result<u64> {
    match config.winning_side {
        Some(winning_side) => {
            let losing_pot = match winning_side {
                BettingSide::Santa => config.grinch_pot,
                BettingSide::Grinch => config.santa_pot,
            };

            Ok(((losing_pot as u128 * 25) / 100) as u64)
        }
        None => {
            // In case of a true tie, return 12.5% of vault amount
            Ok((vault_amount as u128 * 125 / 1000) as u64)
        }
    }
}
