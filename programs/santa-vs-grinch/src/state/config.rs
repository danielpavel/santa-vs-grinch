use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, InitSpace)]
pub enum BettingSide {
    Santa,
    Grinch,
}

#[account]
#[derive(InitSpace)]
pub struct Config {
    pub admin: Pubkey,

    pub admin_fee_percentage_bp: u16,

    pub santa_vault: Pubkey,
    pub grinch_vault: Pubkey,
    pub fees_vault: Pubkey,

    pub santa_pot: u64,
    pub grinch_pot: u64,
    pub santa_boxes: u64,
    pub grinch_boxes: u64,

    pub game_ended: bool,
    pub initialized_at: i64,
    pub winning_side: Option<BettingSide>,

    pub santa_vault_bump: u8,
    pub grinch_vault_bump: u8,
    pub bump: u8,
}
