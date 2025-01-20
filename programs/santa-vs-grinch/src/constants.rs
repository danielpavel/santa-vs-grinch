use anchor_lang::{prelude::Pubkey, pubkey};

pub const GRINCH_BET_TAG: &str = "grinch";
pub const SANTA_BET_TAG: &str = "santa";

pub const CREATOR_WITHDRAWAL_PERIOD: i64 = 60 * 24 * 60 * 60; // 60 days

pub const ADMIN_PUBKEY: Pubkey = pubkey!("5GY5g8w1x1NZYkehip6nSG3FHdBgvhGnUJVNoK9zVGKs");
pub const ADMIN_2_PUBKEY: Pubkey = pubkey!("7pLYRYibjFHtxSxMugqtJuWB1cAEsLsUfTcrZws3dRBn");

pub const SCALING_FACTOR: u64 = 1_000_000_000; // 1e9
