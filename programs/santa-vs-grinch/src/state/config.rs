use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Config {
    pub admin: Pubkey,
    pub santa_vault: Pubkey,
    pub grinch_vault: Pubkey,
    pub santa_vault_bump: u8,
    pub grinch_vault_bump: u8,
    pub bump: u8,
}
