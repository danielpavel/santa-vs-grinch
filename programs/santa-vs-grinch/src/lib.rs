use anchor_lang::prelude::*;

declare_id!("BZGCW6asmdxFTxo1xNpgBPnX9Seb5oLfPDEy3QqLpPPE");

mod constants;
mod contexts;
mod errors;
mod state;
mod utils;

use contexts::*;
use state::Creator;

#[program]
pub mod santa_vs_grinch {

    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>,
        creators: Vec<Creator>,
        max_num_creators: u8,
        admin_fee_percentage_bp: u16,
    ) -> Result<()> {
        ctx.accounts.initialize(
            creators,
            max_num_creators,
            admin_fee_percentage_bp,
            &ctx.bumps,
        )
    }

    pub fn bet(ctx: Context<Bet>, amount: u64, bet_tag: String) -> Result<()> {
        ctx.accounts.bet(amount, bet_tag, ctx.bumps.user_bet)
    }

    pub fn buy_mystery_box(ctx: Context<MysteryBox>, bet_tag: String) -> Result<()> {
        ctx.accounts.buy_mystery_box(bet_tag, ctx.bumps.user_bet)
    }

    pub fn end_game(ctx: Context<EndGame>) -> Result<()> {
        ctx.accounts.end_game()
    }

    pub fn claim_winnings(ctx: Context<ClaimWinnings>, bet_tag: String) -> Result<()> {
        ctx.accounts.claim_winnings(bet_tag)
    }

    pub fn withdraw_fees<'info>(
        ctx: Context<'_, '_, '_, 'info, WithdrawFees<'info>>,
    ) -> Result<()> {
        ctx.accounts.withdraw_fees(ctx.remaining_accounts)
    }

    pub fn withdraw_creators_winnings<'info>(
        ctx: Context<'_, '_, '_, 'info, WithdrawCreatorsWinnings<'info>>,
    ) -> Result<()> {
        ctx.accounts.withdraw_fees(ctx.remaining_accounts)
    }

    pub fn withdraw_unclaimed_creators_winnings<'info>(
        ctx: Context<'_, '_, '_, 'info, WithdrawCreatorsWinnings<'info>>,
    ) -> Result<()> {
        ctx.accounts.withdraw_unclaimed_fees(ctx.remaining_accounts)
    }
}
