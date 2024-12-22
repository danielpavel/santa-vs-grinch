use anchor_lang::prelude::*;

use crate::{
    errors::SantaVsGrinchErrorCode,
    state::{BettingSide, Config},
    utils::assert_game_is_active,
};

#[derive(Accounts)]
pub struct EndGame<'info> {
    #[account(
        mut,
        address = state.admin @ SantaVsGrinchErrorCode::InvalidAdmin
    )]
    admin: Signer<'info>,

    #[account(
        mut,
        seeds = [b"state", state.admin.key().as_ref()],
        bump = state.bump
     )]
    pub state: Account<'info, Config>,

    // #[account(address = slot_hashes::ID)]
    /// CHECK: it's checked
    // recent_slothashes: UncheckedAccount<'info>,
    system_program: Program<'info, System>,
}

impl<'info> EndGame<'info> {
    pub fn end_game(&mut self) -> Result<()> {
        assert_game_is_active(&self.state)?;

        let config = &mut self.state;
        config.game_ended = true;

        // let santa_seed = generate_random_seed(&self.recent_slothashes, true)?;
        // let grinch_seed = generate_random_seed(&self.recent_slothashes, false)?;
        //
        // let (santa_adjusted, grinch_adjusted) =
        //     calculate_final_pots(config, santa_seed, grinch_seed)?;

        let santa_score = self.state.santa_score;
        let grinch_score = self.state.grinch_score;
        self.state.winning_side = if santa_score > grinch_score {
            Some(BettingSide::Santa)
        } else if grinch_score > santa_score {
            Some(BettingSide::Grinch)
        } else {
            None // True tie
        };

        Ok(())
    }
}
