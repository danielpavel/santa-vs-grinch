use anchor_lang::{
    prelude::*,
    system_program::{transfer, Transfer},
};

// use anchor_spl::{
//     associated_token::AssociatedToken,
//     token_interface::{Mint, TokenInterface},
// };

use crate::{
    constants::{GRINCH_BET_TAG, SANTA_BET_TAG},
    errors::SantaVsGrinchErrorCode,
    state::{Config, UserBet},
    utils::{assert_bet_tag, assert_game_is_active, calculate_percentage_amount},
};

#[derive(Accounts)]
#[instruction(_amount: u64, bet_tag: String)]
pub struct Bet<'info> {
    #[account(mut)]
    user: Signer<'info>,

    #[account(
        mut,
        address = state.buyback_wallet @ SantaVsGrinchErrorCode::InvalidBuybackwallet
    )]
    /// CHECK: we check it against `buyback_wallet` field state
    buyback_wallet: UncheckedAccount<'info>,

    // #[account(mut)]
    // mint: InterfaceAccount<'info, Mint>,
    #[account(
        mut,
        has_one = buyback_wallet @ SantaVsGrinchErrorCode::InvalidBuybackwallet,
        // has_one = mint @ SantaVsGrinchErrorCode::InvalidMint,
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
    pub vault: SystemAccount<'info>,

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

        let amount_to_buyback =
            calculate_percentage_amount(amount, self.state.buyback_percentage_bp);
        let amount_to_deposit = amount
            .checked_sub(amount_to_buyback)
            .ok_or(ProgramError::ArithmeticOverflow)?;

        self.transfer_to_vault(amount_to_deposit)?;
        self.transfer_to_buyback(amount_to_buyback)?;

        let mul = if self.state.total_burned > 0 {
            self.state
                .total_burned
                .checked_div(self.state.total_sol)
                .ok_or(ProgramError::ArithmeticOverflow)?
        } else {
            1500
        };

        let score = amount
            .checked_mul(mul as u64)
            .ok_or(ProgramError::ArithmeticOverflow)?;

        msg!("mul {:?} | sc: {:?}", mul, score);

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
                self.state.santa_score = self
                    .state
                    .santa_score
                    .checked_add(score)
                    .ok_or(ProgramError::ArithmeticOverflow)?;
            }
            GRINCH_BET_TAG => {
                self.state.grinch_pot = self
                    .state
                    .grinch_pot
                    .checked_add(amount_to_deposit)
                    .ok_or(ProgramError::ArithmeticOverflow)?;
                self.state.grinch_score = self
                    .state
                    .grinch_score
                    .checked_add(score)
                    .ok_or(ProgramError::ArithmeticOverflow)?;
            }
            _ => {}
        }

        self.state.total_sol = self
            .state
            .total_sol
            .checked_add(amount)
            .ok_or(ProgramError::ArithmeticOverflow)?;
        self.state.total_sent_to_buyback = self
            .state
            .total_sent_to_buyback
            .checked_add(amount_to_buyback)
            .ok_or(ProgramError::ArithmeticOverflow)?;

        Ok(())
    }

    fn transfer_to_vault(&mut self, amount: u64) -> Result<()> {
        let accounts = Transfer {
            from: self.user.to_account_info(),
            to: self.vault.to_account_info(),
        };

        let cpi_context = CpiContext::new(self.system_program.to_account_info(), accounts);

        transfer(cpi_context, amount)
    }

    fn transfer_to_buyback(&mut self, amount: u64) -> Result<()> {
        let accounts = Transfer {
            from: self.user.to_account_info(),
            to: self.buyback_wallet.to_account_info(),
        };

        let cpi_context = CpiContext::new(self.system_program.to_account_info(), accounts);

        transfer(cpi_context, amount)
    }

    // fn burn_to_hell(&mut self, amount: u64) -> Result<()> {
    //     let accounts = Burn {
    //         mint: self.mint.to_account_info(),
    //         from: self.user_ata.to_account_info(),
    //         authority: self.user.to_account_info(),
    //     };
    //
    //     let cpi_ctx = CpiContext::new(self.token_program.to_account_info(), accounts);
    //
    //     burn(cpi_ctx, amount)
    // }
}
