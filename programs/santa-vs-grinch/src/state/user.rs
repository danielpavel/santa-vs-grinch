use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct UserBet {
    pub owner: Pubkey,
    pub amount: u64,
    pub token_amount: u64,
    pub claimed: bool,
    pub bump: u8,
}
