use anchor_lang::prelude::*;

use crate::state::Config;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    admin: Signer<'info>,

    #[account(
         init,
         payer = admin,
         space = 8 + Config::INIT_SPACE,
         seeds = [b"state", admin.key().as_ref()],
         bump
     )]
    state: Account<'info, Config>,

    #[account(
        seeds = [b"vault", state.key().as_ref()],
        bump,
    )]
    pub vault: SystemAccount<'info>,

    system_program: Program<'info, System>,
}

impl<'info> Initialize<'info> {
    pub fn initialize(&mut self, bumps: &InitializeBumps) {
        self.state.set_inner(Config {
            admin: self.admin.key(),
            vault: self.vault.key(),
            vault_bump: bumps.vault,
            bump: bumps.state,
        });
    }
}
