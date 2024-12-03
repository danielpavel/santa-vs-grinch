use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct User {
    pub santa_points: u64,
    pub grinch_points: u64,
    pub bump: u8,
}
