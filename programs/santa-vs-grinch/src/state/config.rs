use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Config {
    pub admin: Pubkey,
    pub vault: Pubkey,
    pub vault_bump: u8,
    pub bump: u8,
}
