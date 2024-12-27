use anchor_lang::prelude::*;
use anchor_spl::token_interface::{
    transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked,
};

use crate::state::Config;
use crate::{errors::SantaVsGrinchErrorCode, utils::calculate_creators_winnings};

#[derive(Accounts)]
pub struct WithdrawCreatorsWinnings<'info> {
    #[account(
        mut,
        address = state.admin @ SantaVsGrinchErrorCode::InvalidAdmin
        )]
    admin: Signer<'info>,

    mint: InterfaceAccount<'info, Mint>,

    #[account(
        mut,
        has_one = vault @ SantaVsGrinchErrorCode::InvalidVaultWinningsAccount,
        seeds = [b"state", state.admin.key().as_ref()],
        bump = state.bump
     )]
    pub state: Account<'info, Config>,

    #[account(
        mut,
        seeds = [b"vault", state.key().as_ref(), b"santa-vs-grinch"],
        bump = state.vault_bump
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>,

    system_program: Program<'info, System>,
    token_program: Interface<'info, TokenInterface>,
}

impl<'info> WithdrawCreatorsWinnings<'info> {
    pub fn withdraw_fees<'a>(
        &mut self,
        remaining_accounts: &'a [AccountInfo<'info>],
    ) -> Result<()> {
        require!(self.state.game_ended, SantaVsGrinchErrorCode::GameNotEnded);

        let state = self.state.clone();
        let pot = calculate_creators_winnings(self.vault.amount, &state)?;

        let bump = [self.state.vault_bump];
        let signer_seeds = [&[
            b"vault",
            state.to_account_info().key.as_ref(),
            b"santa-vs-grinch",
            &bump,
        ][..]];

        let remaining_accounts_iter = &mut remaining_accounts.iter();
        for creator in self.state.creators.iter_mut() {
            let current_creator_ata = next_account_info(remaining_accounts_iter)?;
            require!(
                creator.pubkey == current_creator_ata.key(),
                SantaVsGrinchErrorCode::InvalidCreatorAddress
            );
            require!(
                !creator.claimed,
                SantaVsGrinchErrorCode::CreatorWithdrawalAlreadyClaimed
            );

            let amount = (creator.share_in_bp as u64)
                .checked_mul(pot)
                .ok_or(ProgramError::ArithmeticOverflow)?
                .checked_div(10_000)
                .ok_or(ProgramError::ArithmeticOverflow)?;

            let cpi_context = CpiContext::new_with_signer(
                self.system_program.to_account_info(),
                TransferChecked {
                    from: self.vault.to_account_info(),
                    to: current_creator_ata.to_account_info(),
                    mint: self.mint.to_account_info(),
                    authority: state.to_account_info(),
                },
                &signer_seeds,
            );

            transfer_checked(cpi_context, amount, self.mint.decimals)?;

            creator.claimed = true;
        }

        Ok(())
    }
}
