use anchor_lang::{
    prelude::*,
    system_program::{transfer, Transfer},
};

use crate::errors::SantaVsGrinchErrorCode;
use crate::{
    state::{Config, UserBet},
    utils::calculate_winnings,
};

#[derive(Accounts)]
pub struct ClaimWinnings<'info> {
    #[account(mut)]
    claimer: Signer<'info>,

    #[account(
        mut,
        has_one = vault @ SantaVsGrinchErrorCode::InvalidVaultDepositAccount,
        seeds = [b"state", state.admin.key().as_ref()],
        bump = state.bump
     )]
    pub state: Account<'info, Config>,

    #[account(
        mut,
        address = state.vault @ SantaVsGrinchErrorCode::InvalidVaultDepositAccount,
        seeds = [b"vault", state.key().as_ref(), b"santa-vs-grinch"],
        bump = state.vault_bump
    )]
    pub vault: SystemAccount<'info>,

    #[account(
        mut,
        seeds = [b"user", claimer.key().as_ref()],
        bump
    )]
    user_bet: Account<'info, UserBet>,

    system_program: Program<'info, System>,
}

impl<'info> ClaimWinnings<'info> {
    pub fn claim_winnings(&mut self) -> Result<()> {
        require!(self.state.game_ended, SantaVsGrinchErrorCode::GameNotEnded);
        require!(
            !self.user_bet.claimed,
            SantaVsGrinchErrorCode::AlreadyClaimed
        );

        let user_bet = &mut self.user_bet;
        let config = &mut self.state;

        // Calculate winnings based on the game outcome
        let winning_amount = calculate_winnings(user_bet.amount, user_bet.side, config)?;

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
                Transfer {
                    from: self.vault.to_account_info(),
                    to: self.claimer.to_account_info(),
                },
                &signer_seeds,
            );

            transfer(cpi_context, winning_amount)?;
        }

        user_bet.claimed = true;

        Ok(())
    }
}
