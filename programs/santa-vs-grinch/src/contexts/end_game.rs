use anchor_lang::prelude::*;

use crate::{
    errors::SantaVsGrinchErrorCode,
    state::{BettingSide, Config},
    utils::{assert_game_is_active, calculate_final_pots},
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

    system_program: Program<'info, System>,
}

impl<'info> EndGame<'info> {
    pub fn end_game(&mut self) -> Result<()> {
        assert_game_is_active(&self.state)?;

        let config = &mut self.state;
        config.game_ended = true;

        let (santa_adjusted, grinch_adjusted) = calculate_final_pots(
            self.state.santa_pot,
            self.state.grinch_pot,
            self.state.santa_boxes,
            self.state.grinch_boxes,
        )?;

        self.state.winning_side = if santa_adjusted > grinch_adjusted {
            Some(BettingSide::Santa)
        } else if grinch_adjusted > santa_adjusted {
            Some(BettingSide::Grinch)
        } else if self.state.santa_pot > self.state.grinch_pot {
            Some(BettingSide::Santa)
        } else if self.state.grinch_pot > self.state.santa_pot {
            Some(BettingSide::Grinch)
        } else {
            None // True tie
        };

        Ok(())
    }
}
