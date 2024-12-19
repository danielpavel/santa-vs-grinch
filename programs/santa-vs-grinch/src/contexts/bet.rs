use anchor_lang::prelude::*;

use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{
        burn, transfer_checked, Burn, Mint, TokenAccount, TokenInterface, TransferChecked,
    },
};

use crate::{
    constants::{GRINCH_BET_TAG, SANTA_BET_TAG},
    errors::SantaVsGrinchErrorCode,
    state::{Config, UserBet},
    utils::{assert_bet_tag, assert_game_is_active, calculate_amount_to_burn},
};

#[derive(Accounts)]
#[instruction(_amount: u64, bet_tag: String)]
pub struct Bet<'info> {
    #[account(mut)]
    user: Signer<'info>,

    mint: InterfaceAccount<'info, Mint>,

    #[account(
        mut,
        has_one = mint @ SantaVsGrinchErrorCode::InvalidMint,
        has_one = vault @ SantaVsGrinchErrorCode::InvalidVaultDepositAccount,
        has_one = fees_vault @ SantaVsGrinchErrorCode::InvalidFeesVaultDepositAccount,
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
        seeds = [b"vault", state.key().as_ref(), b"fees"],
        bump = state.fees_vault_bump
    )]
    pub fees_vault: InterfaceAccount<'info, TokenAccount>,

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

impl<'info> Bet<'info> {
    pub fn bet(&mut self, amount: u64, bet_tag: String, user_bet_bump: u8) -> Result<()> {
        assert_game_is_active(&self.state)?;
        assert_bet_tag(&bet_tag)?;

        let amount_to_burn = calculate_amount_to_burn(amount, self.state.bet_burn_percentage_bp);
        let amount_to_deposit = amount
            .checked_sub(amount_to_burn)
            .ok_or(ProgramError::ArithmeticOverflow)?;

        self.transfer_to_vault(amount_to_deposit)?;
        self.burn_to_hell(amount_to_burn)?;

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

        self.state.total_burned = self
            .state
            .total_burned
            .checked_add(amount_to_burn)
            .ok_or(ProgramError::ArithmeticOverflow)?;

        Ok(())
    }

    fn transfer_to_vault(&mut self, amount: u64) -> Result<()> {
        let accounts = TransferChecked {
            from: self.user_ata.to_account_info(),
            mint: self.mint.to_account_info(),
            to: self.vault.to_account_info(),
            authority: self.user.to_account_info(),
        };

        let cpi_context = CpiContext::new(self.token_program.to_account_info(), accounts);

        transfer_checked(cpi_context, amount, self.mint.decimals)
    }

    fn burn_to_hell(&mut self, amount: u64) -> Result<()> {
        let accounts = Burn {
            mint: self.mint.to_account_info(),
            from: self.user_ata.to_account_info(),
            authority: self.user.to_account_info(),
        };

        let cpi_ctx = CpiContext::new(self.token_program.to_account_info(), accounts);

        burn(cpi_ctx, amount)
    }
}
