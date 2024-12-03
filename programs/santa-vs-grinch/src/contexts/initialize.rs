use anchor_lang::prelude::*;

use crate::errors::SantaVsGrinchErrorCode;
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

    #[account(
        seeds = [b"vault", state.key().as_ref(), b"fees"],
        bump,
    )]
    pub fees_vault: SystemAccount<'info>,

    system_program: Program<'info, System>,
}

impl<'info> Initialize<'info> {
    pub fn initialize(
        &mut self,
        bumps: &InitializeBumps,
        admin_fee_percentage_bp: u16,
    ) -> Result<()> {
        require!(
            admin_fee_percentage_bp <= 10_000,
            SantaVsGrinchErrorCode::InvalidPercentage
        );
        let timestamp = Clock::get()?.unix_timestamp;

        self.state.set_inner(Config {
            admin: self.admin.key(),

            admin_fee_percentage_bp,

            fees_vault: self.fees_vault.key(),
            santa_vault: self.santa_vault.key(),
            grinch_vault: self.grinch_vault.key(),

            santa_pot: 0,
            grinch_pot: 0,

            santa_boxes: 0,
            grinch_boxes: 0,

            game_ended: false,

            initialized_at: timestamp,

            winning_side: None,

            santa_vault_bump: bumps.santa_vault,
            grinch_vault_bump: bumps.grinch_vault,
            bump: bumps.state,
        });

        Ok(())
    }
}
