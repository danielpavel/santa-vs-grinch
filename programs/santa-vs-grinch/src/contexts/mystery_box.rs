use anchor_lang::{
    prelude::*,
    system_program::{transfer, Transfer},
};
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{
        burn, transfer_checked, Burn, Mint, TokenAccount, TokenInterface, TransferChecked,
    },
};

use crate::{
    constants::{GRINCH_BET_TAG, SANTA_BET_TAG},
    errors::SantaVsGrinchErrorCode,
    state::UserBet,
    utils::{assert_bet_tag, calculate_amount_to_burn},
};
use crate::{state::Config, utils::assert_game_is_active};

#[derive(Accounts)]
#[instruction(bet_tag: String)]
pub struct MysteryBox<'info> {
    #[account(mut)]
    user: Signer<'info>,

    mint: InterfaceAccount<'info, Mint>,

    #[account(
        mut,
        has_one = mint @ SantaVsGrinchErrorCode::InvalidMint,
        seeds = [b"state", state.admin.key().as_ref(), state.seed.to_le_bytes().as_ref(), state.mint.key().as_ref()],
        bump = state.bump
     )]
    pub state: Account<'info, Config>,

    #[account(
        init_if_needed,
        payer = user,
        space = 8 + UserBet::INIT_SPACE,
        seeds = [b"user", user.key().as_ref(), bet_tag.as_bytes()],
        bump
    )]
    user_bet: Account<'info, UserBet>,

    #[account(
        mut,
        associated_token::mint = state.mint,
        associated_token::authority = user,
        associated_token::token_program = token_program
    )]
    user_ata: InterfaceAccount<'info, TokenAccount>,

    token_program: Interface<'info, TokenInterface>,
    associated_token_program: Program<'info, AssociatedToken>,

    system_program: Program<'info, System>,
}

impl<'info> MysteryBox<'info> {
    pub fn buy_mystery_box(&mut self, bet_tag: String, user_bet_bump: u8) -> Result<()> {
        assert_game_is_active(&self.state)?;
        assert_bet_tag(&bet_tag)?;

        let amount = (self.state.mystery_box_price as u64)
            .checked_mul(10_f64.powi(self.mint.decimals as i32) as u64)
            .ok_or(ProgramError::ArithmeticOverflow)?;
        let amount_to_burn =
            calculate_amount_to_burn(amount, self.state.mystery_box_burn_percentage_bp);

        let accounts = Burn {
            mint: self.mint.to_account_info(),
            from: self.user_ata.to_account_info(),
            authority: self.user.to_account_info(),
        };

        let cpi_ctx = CpiContext::new(self.token_program.to_account_info(), accounts);

        burn(cpi_ctx, amount_to_burn)?;

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

        self.state.total_burned = self
            .state
            .total_burned
            .checked_add(amount_to_burn)
            .ok_or(ProgramError::ArithmeticOverflow)?;

        Ok(())
    }
}
