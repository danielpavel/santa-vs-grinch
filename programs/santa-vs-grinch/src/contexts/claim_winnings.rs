use anchor_lang::{
    prelude::*,
    system_program::{transfer, Transfer},
};

use crate::{state::{BettingSide, Config, UserBet}, utils::calculate_winnings};
use crate::errors::SantaVsGrinchErrorCode;

#[derive(Accounts)]
pub struct ClaimWinnings<'info> {
    #[account(mut)]
    claimer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"state", state.admin.key().as_ref()],
        bump = state.bump
     )]
    pub state: Account<'info, Config>,

    #[account(
        mut,
        constraint = {
            vault.key() == state.santa_vault.key() ||
            vault.key() == state.grinch_vault.key() 
        } @ SantaVsGrinchErrorCode::InvalidVaultDepositAccount
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
        require!(!self.user_bet.claimed, SantaVsGrinchErrorCode::AlreadyClaimed);

        // TODO: I don't like this! I have to check for the losing output vault. Simplify to one vault!
        match self.state.winning_side {
            Some(winning_side) => {
                if winning_side == BettingSide::Santa {
                    require!(self.vault.key() == self.state.grinch_vault, SantaVsGrinchErrorCode::InvalidVaultWinningsAccount);
                } else {
                    require!(self.vault.key() == self.state.santa_vault, SantaVsGrinchErrorCode::InvalidVaultWinningsAccount);
                }
            },
            None => {
                //It's a tie - Withdraw from the vault you have deposited in.
                if self.user_bet.side == BettingSide::Santa {
                    require!(self.vault.key() == self.state.santa_vault, SantaVsGrinchErrorCode::InvalidVaultWinningsAccount);
                } else {
                    require!(self.vault.key() == self.state.grinch_vault, SantaVsGrinchErrorCode::InvalidVaultWinningsAccount);
                }
            }
        }

        let user_bet = &mut self.user_bet;
        let config = &mut self.state;

        // Calculate winnings based on the game outcome
        let winning_amount = calculate_winnings(
            user_bet.amount,
            user_bet.side,
            config,
        )?;


        if winning_amount > 0 {
            let cpi_context = CpiContext::new(
                self.system_program.to_account_info(),
                Transfer {
                    from: self.vault.to_account_info(),
                    to: self.claimer.to_account_info(),
                },
            );

            transfer(cpi_context, winning_amount)?;
        }

        user_bet.claimed = true;

        Ok(())
    }
}
