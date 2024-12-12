use anchor_lang::{
    prelude::*,
    system_program::{transfer, Transfer},
};

use crate::{
    constants::{GRINCH_BET_TAG, SANTA_BET_TAG},
    errors::SantaVsGrinchErrorCode,
    state::UserBet,
    utils::assert_bet_tag,
};
use crate::{state::Config, utils::assert_game_is_active};

#[derive(Accounts)]
#[instruction(bet_tag: String)]
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
        seeds = [b"vault", state.key().as_ref(), b"fees"],
        bump = state.fees_vault_bump
    )]
    pub fees_vault: SystemAccount<'info>,

    #[account(
        init_if_needed,
        payer = user,
        space = 8 + UserBet::INIT_SPACE,
        seeds = [b"user", user.key().as_ref(), bet_tag.as_bytes()],
        bump
    )]
    user_bet: Account<'info, UserBet>,

    system_program: Program<'info, System>,
}

impl<'info> MysteryBox<'info> {
    pub fn buy_mystery_box(&mut self, bet_tag: String, user_bet_bump: u8) -> Result<()> {
        assert_game_is_active(&self.state)?;
        assert_bet_tag(&bet_tag)?;

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

        match bet_tag.as_str() {
            SANTA_BET_TAG => {
                self.state.santa_boxes = self
                    .state
                    .santa_boxes
                    .checked_add(1)
                    .ok_or(ProgramError::ArithmeticOverflow)?;
            }
            GRINCH_BET_TAG => {
                self.state.grinch_boxes = self
                    .state
                    .grinch_boxes
                    .checked_add(1)
                    .ok_or(ProgramError::ArithmeticOverflow)?;
            }
            _ => {}
        }

        let user_bet = &mut self.user_bet;
        user_bet.owner = self.user.key();
        user_bet.bump = user_bet_bump;
        user_bet.claimed = false;
        user_bet.myster_box_count = user_bet
            .myster_box_count
            .checked_add(1)
            .ok_or(ProgramError::ArithmeticOverflow)?;

        Ok(())
    }
}
