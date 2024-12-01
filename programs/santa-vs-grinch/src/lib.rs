use anchor_lang::prelude::*;

declare_id!("BZGCW6asmdxFTxo1xNpgBPnX9Seb5oLfPDEy3QqLpPPE");

mod contexts;
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
}
