use anchor_lang::prelude::*;

declare_id!("BZGCW6asmdxFTxo1xNpgBPnX9Seb5oLfPDEy3QqLpPPE");

mod contexts;
mod errors;
mod state;
mod utils;

use contexts::*;
use state::BettingSide;

#[program]
pub mod santa_vs_grinch {

    use super::*;

    pub fn initialize(ctx: Context<Initialize>, admin_fee_percentage_bp: u16) -> Result<()> {
        ctx.accounts.initialize(&ctx.bumps, admin_fee_percentage_bp)
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
}
