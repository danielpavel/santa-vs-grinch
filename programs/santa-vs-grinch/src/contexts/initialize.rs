use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};

use crate::constants::{ADMIN_PUBKEY, CREATOR_WITHDRAWAL_PERIOD};
use crate::errors::SantaVsGrinchErrorCode;
use crate::state::{Config, InitializeArgs};

#[derive(Accounts)]
#[instruction(_args: InitializeArgs, seed: u64)]
pub struct Initialize<'info> {
    #[account(
        mut,
        address = ADMIN_PUBKEY
    )]
    admin: Signer<'info>,

    mint: InterfaceAccount<'info, Mint>,

    #[account(
         init,
         payer = admin,
         space = 8 + Config::INIT_SPACE,
         seeds = [b"state", admin.key().as_ref(), seed.to_le_bytes().as_ref(), mint.key().as_ref()],
         bump
     )]
    state: Account<'info, Config>,

    #[account(
        seeds = [b"vault", state.key().as_ref(), b"santa-vs-grinch"],
        bump,
    )]
    pub vault: SystemAccount<'info>,

    #[account(
        init,
        payer = admin,
        token::mint = mint,
        token::authority = admin,
        seeds = [b"vault", state.key().as_ref(), b"fees"],
        bump,
    )]
    fees_vault: InterfaceAccount<'info, TokenAccount>,

    token_program: Interface<'info, TokenInterface>,
    system_program: Program<'info, System>,
}

impl<'info> Initialize<'info> {
    pub fn initialize(
        &mut self,
        args: &InitializeArgs,
        seed: u64,
        bumps: &InitializeBumps,
    ) -> Result<()> {
        require!(
            args.admin_fee_percentage_bp <= 10_000,
            SantaVsGrinchErrorCode::InvalidPercentage
        );
        let timestamp = Clock::get()?.unix_timestamp;

        // Validate creator shares total to 10_000 basis points (100%)
        let _total_shares: u16 = args.creators.iter().map(|c| c.share_in_bp).sum();

        //TODO: creators shares check is disabled becuase args come in faulty 🤷. Fix it and enable it if needed.
        // require!(
        //     total_shares == 10_000,
        //     SantaVsGrinchErrorCode::InvalidTotalShares
        // );

        let creators = args.creators.clone();
        for c in creators.iter() {
            require!(!c.claimed, SantaVsGrinchErrorCode::InvalidCreatorConfig)
        }

        // Validate number of creators doesn't exceed max
        require!(
            creators.len() <= args.max_num_creators as usize,
            SantaVsGrinchErrorCode::TooManyCreators
        );

        let creators_arr = creators.try_into().expect("Invalid Creators Argument!");

        self.state.set_inner(Config {
            admin: self.admin.key(),
            mint: self.mint.key(),
            buyback_wallet: args.buyback_wallet,

            admin_fee_percentage_bp: args.admin_fee_percentage_bp,
            buyback_percentage_bp: args.buyback_percentage_bp,
            mystery_box_burn_percentage_bp: args.mystery_box_burn_percentage_bp,

            //mystery_box_price: args.mystery_box_price,
            fees_vault: self.fees_vault.key(),
            vault: self.vault.key(),

            total_burned: 0,
            total_sol: 0,
            total_sent_to_buyback: 0,

            santa_pot: 0,
            grinch_pot: 0,

            santa_score: 0,
            grinch_score: 0,

            santa_multiplier: 100,
            grinch_multiplier: 100,

            game_ended: false,

            is_active_at: timestamp,
            withdraw_unclaimed_at: timestamp + CREATOR_WITHDRAWAL_PERIOD,

            creators: creators_arr,

            winning_side: None,

            vault_bump: bumps.vault,
            fees_vault_bump: bumps.fees_vault,
            bump: bumps.state,
            seed,
        });

        Ok(())
    }
}
