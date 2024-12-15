use anchor_lang::prelude::*;

use crate::errors::SantaVsGrinchErrorCode;
use crate::state::Config;

#[derive(Accounts)]
pub struct UpdateWithdrawUnclaimed<'info> {
    #[account(
        mut,
        address = state.admin @ SantaVsGrinchErrorCode::InvalidAdmin
        )]
    admin: Signer<'info>,

    #[account(
        mut,
        seeds = [b"state", state.admin.key().as_ref()],
        bump = state.bump
     )]
    pub state: Account<'info, Config>,

    system_program: Program<'info, System>,
}

impl<'info> UpdateWithdrawUnclaimed<'info> {
    pub fn update_withdraw_unclaimed_period(
        &mut self,
        withdraw_unclaimed_period_at: i64,
    ) -> Result<()> {
        self.state.withdraw_unclaimed_at = withdraw_unclaimed_period_at;

        Ok(())
    }
}
