use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked},
};

use crate::{
    constants::SANTA_BET_TAG, errors::SantaVsGrinchErrorCode, state::BettingSide,
    utils::assert_bet_tag,
};
use crate::{
    state::{Config, UserBet},
    utils::calculate_winnings,
};

#[derive(Accounts)]
#[instruction(bet_tag: String)]
pub struct ClaimWinnings<'info> {
    #[account(mut)]
    claimer: Signer<'info>,

    mint: InterfaceAccount<'info, Mint>,

    #[account(
        mut,
        has_one = mint @ SantaVsGrinchErrorCode::InvalidMint,
        has_one = vault @ SantaVsGrinchErrorCode::InvalidVaultDepositAccount,
        seeds = [b"state", state.admin.key().as_ref(), state.seed.to_le_bytes().as_ref(), state.mint.key().as_ref()],
        bump = state.bump
     )]
    pub state: Account<'info, Config>,

    #[account(
        mut,
        seeds = [b"vault", state.key().as_ref(), b"santa-vs-grinch"],
        bump = state.vault_bump
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"user", claimer.key().as_ref(), bet_tag.as_bytes()],
        bump
    )]
    user_bet: Account<'info, UserBet>,

    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = claimer,
        associated_token::token_program = token_program
    )]
    user_ata: InterfaceAccount<'info, TokenAccount>,

    token_program: Interface<'info, TokenInterface>,
    associated_token_program: Program<'info, AssociatedToken>,
    system_program: Program<'info, System>,
}

impl<'info> ClaimWinnings<'info> {
    pub fn claim_winnings(&mut self, bet_tag: String) -> Result<()> {
        assert_bet_tag(&bet_tag)?;

        require!(self.state.game_ended, SantaVsGrinchErrorCode::GameNotEnded);
        require!(
            !self.user_bet.claimed,
            SantaVsGrinchErrorCode::AlreadyClaimed
        );

        let user_bet = &mut self.user_bet;
        let config = &mut self.state;

        let user_bet_side = if let SANTA_BET_TAG = bet_tag.as_str() {
            BettingSide::Santa
        } else {
            BettingSide::Grinch
        };
        // Calculate winnings based on the game outcome
        let winning_amount = calculate_winnings(user_bet.amount, user_bet_side, config)?;

        if winning_amount > 0 {
            let bump = [self.state.vault_bump];
            let state = self.state.clone();
            let signer_seeds = [&[
                b"vault",
                state.to_account_info().key.as_ref(),
                b"santa-vs-grinch",
                &bump,
            ][..]];

            let cpi_context = CpiContext::new_with_signer(
                self.system_program.to_account_info(),
                TransferChecked {
                    from: self.vault.to_account_info(),
                    to: self.user_ata.to_account_info(),
                    mint: self.mint.to_account_info(),
                    authority: self.state.to_account_info(),
                },
                &signer_seeds,
            );

            transfer_checked(cpi_context, winning_amount, self.mint.decimals)?;
        }

        user_bet.claimed = true;

        Ok(())
    }
}
