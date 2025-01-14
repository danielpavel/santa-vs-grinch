//! This code was AUTOGENERATED using the kinobi library.
//! Please DO NOT EDIT THIS FILE, instead use visitors
//! to add features, then rerun kinobi to update it.
//!
//! <https://github.com/kinobi-so/kinobi>
//!

use solana_program::pubkey::Pubkey;
use crate::generated::types::Creator;
use borsh::BorshSerialize;
use borsh::BorshDeserialize;

#[derive(BorshSerialize, BorshDeserialize, Clone, Debug, Eq, PartialEq)]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
pub struct InitializeArgs {
pub max_num_creators: u8,
pub admin_fee_percentage_bp: u16,
pub bet_burn_percentage_bp: u16,
pub mystery_box_burn_percentage_bp: u16,
pub mystery_box_price: u64,
#[cfg_attr(feature = "serde", serde(with = "serde_with::As::<serde_with::DisplayFromStr>"))]
pub buyback_wallet: Pubkey,
pub buyback_percentage_bp: u16,
pub creators: [Creator; 3],
}


