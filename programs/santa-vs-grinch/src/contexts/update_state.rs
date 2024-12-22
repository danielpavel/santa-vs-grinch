use anchor_lang::prelude::*;

use crate::errors::SantaVsGrinchErrorCode;
use crate::state::Config;

#[derive(Accounts)]
pub struct UpdateState<'info> {
    #[account(
        mut,
        address = state.admin @ SantaVsGrinchErrorCode::InvalidAdmin
        )]
    admin: Signer<'info>,

    #[account(
        mut,
        seeds = [b"state", admin.key().as_ref(), state.seed.to_le_bytes().as_ref(), state.mint.key().as_ref()],
        bump = state.bump
     )]
    pub state: Account<'info, Config>,

    system_program: Program<'info, System>,
}

impl<'info> UpdateState<'info> {
    pub fn update_withdraw_unclaimed_period(
        &mut self,
        withdraw_unclaimed_period_at: i64,
    ) -> Result<()> {
        self.state.withdraw_unclaimed_at = withdraw_unclaimed_period_at;

        Ok(())
    }

    // pub fn update_mystery_box_price(&mut self, price: u64) -> Result<()> {
    //     self.state.mystery_box_price = price;
    //     Ok(())
    // }

    // pub fn update_bet_burn_percentage_bp(&mut self, percentage_in_bp: u16) -> Result<()> {
    //     self.state.bet_burn_percentage_bp = percentage_in_bp;
    //     Ok(())
    // }

    pub fn update_bet_buyback_percentage_bp(&mut self, percentage_in_bp: u16) -> Result<()> {
        self.state.buyback_percentage_bp = percentage_in_bp;
        Ok(())
    }

    pub fn update_mystery_box_burn_percentage_bp(&mut self, percentage_in_bp: u16) -> Result<()> {
        self.state.mystery_box_burn_percentage_bp = percentage_in_bp;
        Ok(())
    }
}
