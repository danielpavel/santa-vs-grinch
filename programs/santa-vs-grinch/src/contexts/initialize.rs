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
        seeds = [b"vault", state.key().as_ref(), b"santa"],
        bump,
    )]
    pub santa_vault: SystemAccount<'info>,

    #[account(
        seeds = [b"vault", state.key().as_ref(), b"grinch"],
        bump,
    )]
    pub grinch_vault: SystemAccount<'info>,

    system_program: Program<'info, System>,
}

impl<'info> Initialize<'info> {
    pub fn initialize(&mut self, bumps: &InitializeBumps) {
        self.state.set_inner(Config {
            admin: self.admin.key(),
            santa_vault: self.santa_vault.key(),
            grinch_vault: self.grinch_vault.key(),
            santa_vault_bump: bumps.santa_vault,
            grinch_vault_bump: bumps.grinch_vault,
            bump: bumps.state,
        });
    }
}
