use anchor_lang::error_code;

#[error_code]
pub enum SantaVsGrinchErrorCode {
    #[msg("Invalid deposit vault account")]
    InvalidVaultDepositAccount,

    #[msg("Invalid admin")]
    InvalidAdmin,

    #[msg("Invalid fees vault account")]
    InvalidFeesVaultDepositAccount,

    #[msg("Invalid Percentage")]
    InvalidPercentage,

    #[msg("Game has already ended")]
    GameEnded,
}
