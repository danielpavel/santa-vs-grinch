use anchor_lang::error_code;

#[error_code]
pub enum SantaVsGrinchErrorCode {
    #[msg("Invalid deposit vault account")]
    InvalidVaultDepositAccount,
}
