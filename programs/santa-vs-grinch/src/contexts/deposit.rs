use anchor_lang::{
    prelude::*,
    system_program::{transfer, Transfer},
};

use crate::state::{Config, User};
use crate::errors::SantaVsGrinchErrorCode;

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    user: Signer<'info>,

    #[account(
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
        init_if_needed,
        payer = user,
        space = 8 + User::INIT_SPACE,
        seeds = [b"user", user.key().as_ref()],
        bump
    )]
    user_state: Account<'info, User>,

    system_program: Program<'info, System>,
}

impl<'info> Deposit<'info> {
    pub fn deposit(&mut self, amount: u64) -> Result<()> {
        let accounts = Transfer {
            from: self.user.to_account_info(),
            to: self.vault.to_account_info(),
        };

        let cpi_context = CpiContext::new(self.system_program.to_account_info(), accounts);

        transfer(cpi_context, amount)?;

        let user_state = &mut self.user_state;

        match self.vault.key() == self.state.santa_vault {
            true => {
                user_state.santa_points = user_state
                .santa_points
                    .checked_add(amount)
                    .ok_or(ProgramError::ArithmeticOverflow)?;},
            false => {
                user_state.grinch_points = user_state
                .grinch_points
                    .checked_add(amount)
                    .ok_or(ProgramError::ArithmeticOverflow)?;}
        }

        Ok(())
    }
}
