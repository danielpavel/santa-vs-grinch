use anchor_lang::{
    prelude::*,
    system_program::{transfer, Transfer},
};

use crate::errors::SantaVsGrinchErrorCode;
use crate::state::Config;

#[derive(Accounts)]
pub struct WithdrawFees<'info> {
    #[account(
        mut,
        address = state.admin @ SantaVsGrinchErrorCode::InvalidAdmin
        )]
    admin: Signer<'info>,

    #[account(
        mut,
        has_one = fees_vault @ SantaVsGrinchErrorCode::InvalidFeesVaultDepositAccount,
        seeds = [b"state", state.admin.key().as_ref()],
        bump = state.bump
     )]
    pub state: Account<'info, Config>,

    #[account(
        mut,
        seeds = [b"vault", state.key().as_ref(), b"fees"],
        bump = state.fees_vault_bump
    )]
    pub fees_vault: SystemAccount<'info>,

    system_program: Program<'info, System>,
}

impl<'info> WithdrawFees<'info> {
    pub fn withdraw_fees<'a>(
        &mut self,
        remaining_accounts: &'a [AccountInfo<'info>],
    ) -> Result<()> {
        require!(self.state.game_ended, SantaVsGrinchErrorCode::GameNotEnded);

        // TODO: MAYBE Extra - add withdraw window

        let total = self.fees_vault.lamports();

        let state = self.state.clone();
        let bump = [self.state.vault_bump];
        let signer_seeds = [&[
            b"vault",
            state.to_account_info().key.as_ref(),
            b"fees",
            &bump,
        ][..]];

        let remaining_accounts_iter = &mut remaining_accounts.iter();
        for creator in self.state.creators.iter() {
            let current_creator_info = next_account_info(remaining_accounts_iter)?;
            require!(
                creator.pubkey == current_creator_info.key(),
                SantaVsGrinchErrorCode::InvalidCreatorAddress
            );

            let amount = (creator.share_in_bp as u64)
                .checked_mul(total)
                .ok_or(ProgramError::ArithmeticOverflow)?
                .checked_div(10_000)
                .ok_or(ProgramError::ArithmeticOverflow)?;

            let cpi_context = CpiContext::new_with_signer(
                self.system_program.to_account_info(),
                Transfer {
                    from: self.fees_vault.to_account_info(),
                    to: current_creator_info.to_account_info(),
                },
                &signer_seeds,
            );

            transfer(cpi_context, amount)?;
        }

        Ok(())
    }
}
