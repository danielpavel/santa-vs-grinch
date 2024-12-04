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
        msg!("Initailize!");

        ctx.accounts.initialize(&ctx.bumps, admin_fee_percentage_bp)
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        let vault = ctx.accounts.vault.clone();
        let state = ctx.accounts.state.clone();

        match vault.key() == state.santa_vault {
            true => msg!("Deposit for Santa"),
            false => msg!("Deposit for Grinch"),
        }

        ctx.accounts.deposit(amount)
    }

    pub fn buy_mystery_box(ctx: Context<MysteryBox>, side: BettingSide) -> Result<()> {
        ctx.accounts.buy_mystery_box(side)
    }
}
