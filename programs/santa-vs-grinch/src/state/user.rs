use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct UserBet {
    pub owner: Pubkey,
    pub amount: u64,
    pub claimed: bool,
    pub myster_box_count: u32,
    pub bump: u8,
}
