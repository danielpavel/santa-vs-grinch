use anchor_lang::{prelude::*, solana_program::sysvar::slot_hashes};
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{burn, Burn, Mint, TokenAccount, TokenInterface},
};

use crate::{
    constants::{GRINCH_BET_TAG, SANTA_BET_TAG},
    errors::SantaVsGrinchErrorCode,
    state::UserBet,
    utils::{
        assert_bet_tag, calculate_percentage_amount, calculate_perk_multiplier,
        generate_random_seed,
    },
};
use crate::{state::Config, utils::assert_game_is_active};

#[derive(Accounts)]
#[instruction(bet_tag: String)]
pub struct MysteryBox<'info> {
    #[account(mut)]
    user: Signer<'info>,

    mint: InterfaceAccount<'info, Mint>,

    #[account(
        mut,
        has_one = mint @ SantaVsGrinchErrorCode::InvalidMint,
        seeds = [b"state", state.admin.key().as_ref(), state.seed.to_le_bytes().as_ref(), state.mint.key().as_ref()],
        bump = state.bump
     )]
    pub state: Account<'info, Config>,

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

    #[account(address = slot_hashes::ID)]
    /// CHECK: it's checked
    recent_slothashes: UncheckedAccount<'info>,

    system_program: Program<'info, System>,
}

impl<'info> MysteryBox<'info> {
    pub fn buy_mystery_box(
        &mut self,
        amount: u64,
        bet_tag: String,
        user_bet_bump: u8,
    ) -> Result<()> {
        assert_game_is_active(&self.state)?;
        assert_bet_tag(&bet_tag)?;

        let amount_to_burn =
            calculate_percentage_amount(amount, self.state.mystery_box_burn_percentage_bp);

        self.burn_to_hell(amount)?;

        let rand = generate_random_seed(&self.recent_slothashes, true)?;
        let mul = calculate_perk_multiplier(rand, amount, self.mint.decimals);

        let score = amount
            .checked_mul(mul as u64)
            .ok_or(ProgramError::ArithmeticOverflow)?
            .checked_div(100)
            .ok_or(ProgramError::ArithmeticOverflow)?;

        match bet_tag.as_str() {
            SANTA_BET_TAG => {
                self.state.santa_score = self
                    .state
                    .santa_score
                    .checked_add(score)
                    .ok_or(ProgramError::ArithmeticOverflow)?;
            }
            GRINCH_BET_TAG => {
                self.state.grinch_score = self
                    .state
                    .grinch_score
                    .checked_add(score)
                    .ok_or(ProgramError::ArithmeticOverflow)?;
            }
            _ => {}
        }

        let user_bet = &mut self.user_bet;
        user_bet.owner = self.user.key();
        user_bet.bump = user_bet_bump;
        user_bet.claimed = false;
        // user_bet.myster_box_count = user_bet
        //     .myster_box_count
        //     .checked_add(1)
        //     .ok_or(ProgramError::ArithmeticOverflow)?;

        self.state.total_burned = self
            .state
            .total_burned
            .checked_add(amount_to_burn)
            .ok_or(ProgramError::ArithmeticOverflow)?;

        Ok(())
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
