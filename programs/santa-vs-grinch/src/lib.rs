use anchor_lang::prelude::*;

declare_id!("G1rm3S34YvLkGdPH994cAVHxiq2JsGrDhtwKMgQbignc");

mod constants;
mod contexts;
mod errors;
mod state;
mod utils;

use contexts::*;
use state::InitializeArgs;

#[program]
pub mod santa_vs_grinch {

    use super::*;

    pub fn initialize(ctx: Context<Initialize>, args: InitializeArgs, seed: u64) -> Result<()> {
        ctx.accounts.initialize(&args, seed, &ctx.bumps)
    }

    pub fn bet(ctx: Context<Bet>, amount: u64, bet_tag: String) -> Result<()> {
        ctx.accounts.bet(amount, bet_tag, ctx.bumps.user_bet)
    }

    pub fn bet_v2(ctx: Context<BetV2>, amount: u64, bet_tag: String) -> Result<()> {
        ctx.accounts.bet(amount, bet_tag, ctx.bumps.user_bet)
    }

    pub fn buy_mystery_box(ctx: Context<MysteryBox>, amount: u64, bet_tag: String) -> Result<()> {
        ctx.accounts
            .buy_mystery_box(amount, bet_tag, ctx.bumps.user_bet)
    }

    pub fn buy_mystery_box_v2(
        ctx: Context<MysteryBoxV2>,
        amount: u64,
        bet_tag: String,
    ) -> Result<()> {
        ctx.accounts
            .buy_mystery_box(amount, bet_tag, ctx.bumps.user_bet)
    }

    pub fn end_game(ctx: Context<EndGame>) -> Result<()> {
        ctx.accounts.end_game()
    }

    pub fn claim_winnings(ctx: Context<ClaimWinnings>, bet_tag: String) -> Result<()> {
        ctx.accounts.claim_winnings(bet_tag)
    }

    pub fn claim_winnings_v2(ctx: Context<ClaimWinningsV2>, bet_tag: String) -> Result<()> {
        ctx.accounts.claim_winnings(bet_tag)
    }

    // NOTE: Fees are no longer charged - Disable!
    // pub fn withdraw_fees<'info>(
    //     ctx: Context<'_, '_, '_, 'info, WithdrawFees<'info>>,
    // ) -> Result<()> {
    //     ctx.accounts.withdraw_fees(ctx.remaining_accounts)
    // }

    // NOTE: Creator winnings are longer charged - Disable!
    // pub fn withdraw_creators_winnings<'info>(
    //     ctx: Context<'_, '_, '_, 'info, WithdrawCreatorsWinnings<'info>>,
    // ) -> Result<()> {
    //     ctx.accounts.withdraw_fees(ctx.remaining_accounts)
    // }

    // pub fn update_withdraw_unclaimed_at(ctx: Context<UpdateState>, ts: i64) -> Result<()> {
    //     ctx.accounts.update_withdraw_unclaimed_period(ts)
    // }

    // pub fn update_mystery_box_price(ctx: Context<UpdateState>, price: u64) -> Result<()> {
    //     ctx.accounts.update_mystery_box_price(price)
    // }

    // pub fn update_bet_burn_percentage_bp(
    //     ctx: Context<UpdateState>,
    //     percentage_in_bp: u16,
    // ) -> Result<()> {
    //     ctx.accounts.update_bet_burn_percentage_bp(percentage_in_bp)
    // }

    pub fn update_mystery_box_burn_percentage_bp(
        ctx: Context<UpdateState>,
        percentage_in_bp: u16,
    ) -> Result<()> {
        ctx.accounts
            .update_mystery_box_burn_percentage_bp(percentage_in_bp)
    }

    pub fn update_bet_buyback_percentage_bp(
        ctx: Context<UpdateState>,
        percentage_in_bp: u16,
    ) -> Result<()> {
        ctx.accounts
            .update_bet_buyback_percentage_bp(percentage_in_bp)
    }
}
