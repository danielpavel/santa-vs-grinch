use anchor_lang::prelude::*;

use super::BettingSide;

#[account]
#[derive(InitSpace)]
pub struct UserBet {
    pub owner: Pubkey,
    pub amount: u64,
    pub side: BettingSide,
    pub claimed: bool,
}
