use anchor_lang::{
    prelude::*,
    system_program::{transfer, Transfer},
};

use crate::{
    constants::{GRINCH_BET_TAG, SANTA_BET_TAG},
    errors::SantaVsGrinchErrorCode,
    utils::assert_bet_tag,
};
use crate::{
    state::{Config, UserBet},
    utils::{assert_game_is_active, calculate_admin_fee},
};

#[derive(Accounts)]
#[instruction(_amount: u64, bet_tag: String)]
pub struct Bet<'info> {
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
        seeds = [b"user", user.key().as_ref(), bet_tag.as_bytes()],
        bump
    )]
    user_bet: Account<'info, UserBet>,

    system_program: Program<'info, System>,
}

impl<'info> Bet<'info> {
    pub fn bet(&mut self, amount: u64, bet_tag: String, user_bet_bump: u8) -> Result<()> {
        assert_game_is_active(&self.state)?;
        assert_bet_tag(&bet_tag)?;

        let fee = calculate_admin_fee(amount, self.state.admin_fee_percentage_bp);
        let amount_to_deposit = amount
            .checked_sub(fee)
            .ok_or(ProgramError::ArithmeticOverflow)?;

        // deposit to vault
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
        user_bet.bump = user_bet_bump;
        user_bet.amount = user_bet
            .amount
            .checked_add(amount_to_deposit)
            .ok_or(ProgramError::ArithmeticOverflow)?;
        user_bet.claimed = false;

        match bet_tag.as_str() {
            SANTA_BET_TAG => {
                self.state.santa_pot = self
                    .state
                    .santa_pot
                    .checked_add(amount_to_deposit)
                    .ok_or(ProgramError::ArithmeticOverflow)?;
            }
            GRINCH_BET_TAG => {
                self.state.grinch_pot = self
                    .state
                    .grinch_pot
                    .checked_add(amount_to_deposit)
                    .ok_or(ProgramError::ArithmeticOverflow)?;
            }
            _ => {}
        }

        Ok(())
    }
}
