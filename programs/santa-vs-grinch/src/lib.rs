use anchor_lang::prelude::*;

declare_id!("BZGCW6asmdxFTxo1xNpgBPnX9Seb5oLfPDEy3QqLpPPE");

mod contexts;
mod errors;
mod state;
mod utils;

use contexts::*;
use state::{BettingSide, Creator};

#[program]
pub mod santa_vs_grinch {

    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>,
        creators: Vec<Creator>,
        max_num_creators: u8,
        admin_fee_percentage_bp: u16,
    ) -> Result<()> {
        ctx.accounts.initialize(
            creators,
            max_num_creators,
            admin_fee_percentage_bp,
            &ctx.bumps,
        )
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64, bet_side: BettingSide) -> Result<()> {
        ctx.accounts.deposit(amount, bet_side)
    }

    pub fn buy_mystery_box(ctx: Context<MysteryBox>, side: BettingSide) -> Result<()> {
        ctx.accounts.buy_mystery_box(side)
    }

    pub fn end_game(ctx: Context<EndGame>) -> Result<()> {
        ctx.accounts.end_game()
    }

    pub fn claim_winnings(ctx: Context<ClaimWinnings>) -> Result<()> {
        ctx.accounts.claim_winnings()
    }

    pub fn withdraw_fees<'info>(
        ctx: Context<'_, '_, '_, 'info, WithdrawFees<'info>>,
    ) -> Result<()> {
        ctx.accounts.withdraw_fees(ctx.remaining_accounts)
    }
}
