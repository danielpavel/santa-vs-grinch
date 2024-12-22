use anchor_lang::error_code;

#[error_code]
pub enum SantaVsGrinchErrorCode {
    #[msg("Invalid deposit vault account")]
    InvalidVaultDepositAccount,

    #[msg("Invalid winnings vault account")]
    InvalidVaultWinningsAccount,

    #[msg("Invalid admin")]
    InvalidAdmin,

    #[msg("Invalid bet side")]
    InvalidBetSide,

    #[msg("Invalid fees vault account")]
    InvalidFeesVaultDepositAccount,

    #[msg("Invalid Percentage")]
    InvalidPercentage,

    #[msg("Game has already ended")]
    GameEnded,

    #[msg("Game has not ended yet")]
    GameNotEnded,

    #[msg("User has already claimed")]
    AlreadyClaimed,

    #[msg("Invalid total shares")]
    InvalidTotalShares,

    #[msg("Too Many Creators")]
    TooManyCreators,

    #[msg("InvalidCreatorAddress")]
    InvalidCreatorAddress,

    #[msg("InvalidBetTag")]
    InvalidBetTag,

    #[msg("InvalidCreatorConfig")]
    InvalidCreatorConfig,

    #[msg("Creators withdrawal already claimed")]
    CreatorWithdrawalAlreadyClaimed,

    #[msg("Witdrawal unclaimed period not ended")]
    WitdrawalUnclaimedPeriodNotEnded,

    #[msg("Invalid Mint")]
    InvalidMint,

    #[msg("Amount to burn should be 100% of box price")]
    InvalidAmountToBurn,

    #[msg("Invalid buyback wallet")]
    InvalidBuybackwallet,
}
