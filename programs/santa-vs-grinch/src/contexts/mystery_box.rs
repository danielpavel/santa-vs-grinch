use anchor_lang::{
    prelude::*,
    system_program::{transfer, Transfer},
};

use crate::errors::SantaVsGrinchErrorCode;
use crate::{
    state::{BettingSide, Config},
    utils::assert_game_is_active,
};

#[derive(Accounts)]
pub struct MysteryBox<'info> {
    #[account(mut)]
    user: Signer<'info>,

    #[account(
        mut,
        seeds = [b"state", state.admin.key().as_ref()],
        bump = state.bump
     )]
    pub state: Account<'info, Config>,

    #[account(
        mut,
        address = state.fees_vault @ SantaVsGrinchErrorCode::InvalidFeesVaultDepositAccount,
    )]
    pub fees_vault: SystemAccount<'info>,

    system_program: Program<'info, System>,
}

impl<'info> MysteryBox<'info> {
    pub fn buy_mystery_box(&mut self, side: BettingSide) -> Result<()> {
        assert_game_is_active(&self.state)?;

        // TODO: Add it as field in state config
        const BOX_PRICE: u64 = 500_000_000; // 0.5 SOL in lamports

        let cpi_context = CpiContext::new(
            self.system_program.to_account_info(),
            Transfer {
                from: self.user.to_account_info(),
                to: self.fees_vault.to_account_info(),
            },
        );

        transfer(cpi_context, BOX_PRICE)?;

        match side {
            BettingSide::Santa => {
                self.state.santa_boxes = self
                    .state
                    .santa_boxes
                    .checked_add(1)
                    .ok_or(ProgramError::ArithmeticOverflow)?;
            }

            BettingSide::Grinch => {
                self.state.grinch_boxes = self
                    .state
                    .grinch_boxes
                    .checked_add(1)
                    .ok_or(ProgramError::ArithmeticOverflow)?;
            }
        }

        Ok(())
    }
}
