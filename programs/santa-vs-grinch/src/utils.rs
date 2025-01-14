use anchor_lang::prelude::*;
use arrayref::array_ref;

use crate::constants::{GRINCH_BET_TAG, SANTA_BET_TAG};
use crate::errors::SantaVsGrinchErrorCode;
use crate::state::{BettingSide, Config};

pub fn assert_game_is_active(config: &Account<Config>) -> Result<()> {
    require!(!config.game_ended, SantaVsGrinchErrorCode::GameEnded);
    require!(
        Clock::get()?.unix_timestamp >= config.is_active_at,
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

pub fn calculate_percentage_amount(amount: u64, percentage_bp: u16) -> u64 {
    ((amount as u128 * percentage_bp as u128) / 10_000u128) as u64
}

/*
 * Map the `seed` to a number in the 100-500 range.
 * 100 = multiplier 1
 * 500 = multiplier 5
 */
// fn map_to_range(seed: u64) -> u32 {
//     // Get number between 0 and 400 (400 possible numbers)
//     let base = (seed % 401) as u32;
//
//     // Then add 100 to shift the range from 0..400 to 100..500
//     base + 100
// }

fn map_random_to_multiplier_range(random: u64, min_range: u32, max_range: u32) -> u32 {
    let base = (random % ((max_range as u64 - min_range as u64) + 1)) as u32;

    base + min_range
}

pub fn calculate_perk_multiplier(random: u64, amount: u64, decimals: u8) -> u32 {
    let base = 10_u64.pow(decimals as u32);
    let tier_1_max = 10_000 * base;
    let tier_2_max = 100_000 * base;

    let mul_range = if amount <= tier_1_max {
        (105, 120)
    } else if amount <= tier_2_max {
        (121, 170)
    } else {
        (171, 220)
    };

    map_random_to_multiplier_range(random, mul_range.0, mul_range.1)
}

// fn calculate_perk_score(amount: u64, decimals: u8) -> u64 {
//     let min_range: u32;
//     let max_range: u32;
//
//     let (min_range, max_range) = if (amount >= 0 && amount <= (10_000 * 10_u64.pow(decimals))) {
//         (105, 120)
//     } else if (amount > (10_000 * 10_u64.pow(decimals))
//         && amount <= (100_000 * 10_u64.pow(decimals)))
//     {
//         (121, 170)
//     } else {
//         (171, 220)
//     };
// }

// pub fn calculate_final_pots(
//     config_state: &mut Config,
//     santa_seed: u64,
//     grinch_seed: u64,
// ) -> Result<(u64, u64)> {
//     let santa_multiplier = map_to_range(santa_seed);
//     let grinch_multiplier = map_to_range(grinch_seed);
//
//     // Update config state
//     config_state.santa_multiplier = santa_multiplier;
//     config_state.grinch_multiplier = grinch_multiplier;
//
//     msg!("sm: {} | gm: {}", santa_multiplier, grinch_multiplier);
//
//     let santa_pot_multiplier = config_state
//         .santa_score
//         .checked_mul(santa_multiplier as u64)
//         .ok_or(ProgramError::ArithmeticOverflow)?;
//     let grinch_pot_multiplier = config_state
//         .grinch_score
//         .checked_mul(grinch_multiplier as u64)
//         .ok_or(ProgramError::ArithmeticOverflow)?;
//
//     msg!(
//         "spm: {} | gpm: {}",
//         santa_pot_multiplier,
//         grinch_pot_multiplier
//     );
//
//     let santa_adjusted_pot = config_state
//         .santa_pot
//         .checked_mul(santa_pot_multiplier)
//         .ok_or(ProgramError::ArithmeticOverflow)?
//         .checked_div(100)
//         .ok_or(ProgramError::ArithmeticOverflow)?;
//     let grinch_adjusted_pot = config_state
//         .grinch_pot
//         .checked_mul(grinch_pot_multiplier)
//         .ok_or(ProgramError::ArithmeticOverflow)?
//         .checked_div(100)
//         .ok_or(ProgramError::ArithmeticOverflow)?;
//
//     msg!("sap: {} | gap: {}", santa_adjusted_pot, grinch_adjusted_pot);
//
//     Ok((santa_adjusted_pot, grinch_adjusted_pot))
// }

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
                // let losing_pot_share = (losing_pot as u128 * 75) / 100;

                // Calculate individual winner's share based on their contribution to winning pot
                let winner_share = bet_amount
                    .checked_mul(losing_pot)
                    .ok_or(ProgramError::ArithmeticOverflow)?
                    .checked_div(winning_pot)
                    .ok_or(ProgramError::ArithmeticOverflow)?;

                // Return original bet plus winnings
                Ok(bet_amount
                    .checked_add(winner_share)
                    .ok_or(ProgramError::ArithmeticOverflow)?)
            } else {
                // Losing side gets nothing
                Ok(0)
            }
        }
        None => Ok(bet_amount),
    }
}

// pub fn calculate_creators_winnings(vault_amount: u64, config: &Config) -> Result<u64> {
//     match config.winning_side {
//         Some(winning_side) => {
//             let losing_pot = match winning_side {
//                 BettingSide::Santa => config.grinch_pot,
//                 BettingSide::Grinch => config.santa_pot,
//             };
//
//             Ok(((losing_pot as u128 * 25) / 100) as u64)
//         }
//         None => {
//             // In case of a true tie, return 12.5% of vault amount
//             Ok((vault_amount as u128 * 125 / 1000) as u64)
//         }
//     }
// }

pub fn generate_random_seed(recent_slothashes: &AccountInfo, is_santa: bool) -> Result<u64> {
    //let recent_slothashes = &ctx.accounts.recent_slothashes;
    let data = recent_slothashes.data.borrow();

    let index = match is_santa {
        true => 16,
        false => 24,
    };
    let most_recent = array_ref![data, index, 8];

    let clock = Clock::get()?;

    // seed for the random number is a combination of the slot_hash - timestamp
    Ok(u64::from_le_bytes(*most_recent).saturating_sub(clock.unix_timestamp as u64))
}
