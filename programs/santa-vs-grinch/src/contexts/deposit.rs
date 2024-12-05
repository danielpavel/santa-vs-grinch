use anchor_lang::{
    prelude::*,
    system_program::{transfer, Transfer},
};

use crate::errors::SantaVsGrinchErrorCode;
use crate::{
    state::{BettingSide, Config, UserBet},
    utils::{assert_game_is_active, calculate_admin_fee},
};

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    user: Signer<'info>,

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
        address = state.fees_vault @ SantaVsGrinchErrorCode::InvalidFeesVaultDepositAccount,
    )]
    pub fees_vault: SystemAccount<'info>,

    #[account(
        init_if_needed,
        payer = user,
        space = 8 + UserBet::INIT_SPACE,
        seeds = [b"user", user.key().as_ref()],
        bump
    )]
    user_bet: Account<'info, UserBet>,

    system_program: Program<'info, System>,
}

impl<'info> Deposit<'info> {
    pub fn deposit(&mut self, amount: u64, bet_side: BettingSide) -> Result<()> {
        assert_game_is_active(&self.state)?;

        let fee = calculate_admin_fee(amount, self.state.admin_fee_percentage_bp);
        let amount_to_deposit = amount
            .checked_sub(fee)
            .ok_or(ProgramError::ArithmeticOverflow)?;

        // deposit to santa / grinch vault
        let accounts = Transfer {
            from: self.user.to_account_info(),
            to: self.vault.to_account_info(),
        };

        let cpi_context = CpiContext::new(self.system_program.to_account_info(), accounts);

        transfer(cpi_context, amount_to_deposit)?;

        // deposit to fee vault;
        let accounts = Transfer {
            from: self.user.to_account_info(),
            to: self.fees_vault.to_account_info(),
        };

        let cpi_context = CpiContext::new(self.system_program.to_account_info(), accounts);

        transfer(cpi_context, fee)?;

        let user_bet = &mut self.user_bet;
        user_bet.owner = self.user.key();
        user_bet.amount = user_bet
            .amount
            .checked_add(amount_to_deposit)
            .ok_or(ProgramError::ArithmeticOverflow)?;
        user_bet.claimed = false;
        user_bet.side = bet_side;

        match bet_side {
            BettingSide::Santa => {
                self.state.santa_pot = self
                    .state
                    .santa_pot
                    .checked_add(amount_to_deposit)
                    .ok_or(ProgramError::ArithmeticOverflow)?;
            }
            BettingSide::Grinch => {
                user_bet.side = BettingSide::Grinch;
                self.state.grinch_pot = self
                    .state
                    .grinch_pot
                    .checked_add(amount_to_deposit)
                    .ok_or(ProgramError::ArithmeticOverflow)?;
            }
            // TODO: Not sure if user can sent an invalid `bet_side`
            _ => return Err(anchor_lang::error!(SantaVsGrinchErrorCode::InvalidBetSide)),
        }

        Ok(())
    }
}
