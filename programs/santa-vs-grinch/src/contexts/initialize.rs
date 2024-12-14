use anchor_lang::prelude::*;

use crate::constants::CREATOR_WITHDRAWAL_PERIOD;
use crate::errors::SantaVsGrinchErrorCode;
use crate::state::{Config, Creator};

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    admin: Signer<'info>,

    #[account(
         init,
         payer = admin,
         space = 8 + Config::INIT_SPACE,
         seeds = [b"state", admin.key().as_ref()],
         bump
     )]
    state: Account<'info, Config>,

    #[account(
        seeds = [b"vault", state.key().as_ref(), b"santa-vs-grinch"],
        bump,
    )]
    pub vault: SystemAccount<'info>,

    #[account(
        seeds = [b"vault", state.key().as_ref(), b"fees"],
        bump,
    )]
    pub fees_vault: SystemAccount<'info>,

    system_program: Program<'info, System>,
}

impl<'info> Initialize<'info> {
    pub fn initialize(
        &mut self,
        creators: Vec<Creator>,
        max_num_creators: u8,
        admin_fee_percentage_bp: u16,
        bumps: &InitializeBumps,
    ) -> Result<()> {
        require!(
            admin_fee_percentage_bp <= 10_000,
            SantaVsGrinchErrorCode::InvalidPercentage
        );
        let timestamp = Clock::get()?.unix_timestamp;

        // Validate creator shares total to 10_000 basis points (100%)
        let total_shares: u16 = creators.iter().map(|c| c.share_in_bp).sum();

        require!(
            total_shares == 10_000,
            SantaVsGrinchErrorCode::InvalidTotalShares
        );

        for c in creators.iter() {
            require!(!c.claimed, SantaVsGrinchErrorCode::InvalidCreatorConfig)
        }

        // Validate number of creators doesn't exceed max
        require!(
            creators.len() <= max_num_creators as usize,
            SantaVsGrinchErrorCode::TooManyCreators
        );

        let creators_arr = creators.try_into().expect("Invalid Creators Argument!");

        self.state.set_inner(Config {
            admin: self.admin.key(),

            admin_fee_percentage_bp,

            fees_vault: self.fees_vault.key(),
            vault: self.vault.key(),

            santa_pot: 0,
            grinch_pot: 0,

            santa_boxes: 0,
            grinch_boxes: 0,

            santa_multiplier: 100,
            grinch_multiplier: 100,

            game_ended: false,

            initialized_at: timestamp,
            withdraw_unclaimed_at: timestamp + CREATOR_WITHDRAWAL_PERIOD,

            creators: creators_arr,

            winning_side: None,

            vault_bump: bumps.vault,
            fees_vault_bump: bumps.fees_vault,
            bump: bumps.state,
        });

        Ok(())
    }
}
