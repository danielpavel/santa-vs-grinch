use anchor_lang::prelude::*;

pub const MAX_CREATORS: usize = 3;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Debug, InitSpace)]
pub enum BettingSide {
    Santa,
    Grinch,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Debug, InitSpace)]
pub struct Creator {
    pub pubkey: Pubkey,
    pub share_in_bp: u16,
    pub claimed: bool,
}

#[account]
#[derive(InitSpace)]
pub struct Config {
    pub admin: Pubkey,

    pub admin_fee_percentage_bp: u16,

    pub vault: Pubkey,
    pub fees_vault: Pubkey,

    pub santa_pot: u64,
    pub grinch_pot: u64,
    pub santa_boxes: u64,
    pub grinch_boxes: u64,
    pub santa_multiplier: u32,
    pub grinch_multiplier: u32,

    pub game_ended: bool,
    pub initialized_at: i64,
    pub withdraw_unclaimed_at: i64,
    pub winning_side: Option<BettingSide>,

    #[max_len(MAX_CREATORS * mem::size_of::<Creator>())]
    pub creators: [Creator; MAX_CREATORS],

    pub vault_bump: u8,
    pub fees_vault_bump: u8,
    pub bump: u8,
}
