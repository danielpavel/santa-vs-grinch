use anchor_lang::prelude::*;

declare_id!("BZGCW6asmdxFTxo1xNpgBPnX9Seb5oLfPDEy3QqLpPPE");

mod contexts;
mod errors;
mod state;

use contexts::*;

#[program]
pub mod santa_vs_grinch {

    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Initailize!");

        ctx.accounts.initialize(&ctx.bumps);

        Ok(())
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
}
