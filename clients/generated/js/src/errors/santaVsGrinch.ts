/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/kinobi-so/kinobi
 */

import {
  isProgramError,
  type Address,
  type SOLANA_ERROR__INSTRUCTION_ERROR__CUSTOM,
  type SolanaError,
} from '@solana/web3.js';
import { SANTA_VS_GRINCH_PROGRAM_ADDRESS } from '../programs';

/** InvalidVaultDepositAccount: Invalid deposit vault account */
export const SANTA_VS_GRINCH_ERROR__INVALID_VAULT_DEPOSIT_ACCOUNT = 0x1770; // 6000
/** InvalidVaultWinningsAccount: Invalid winnings vault account */
export const SANTA_VS_GRINCH_ERROR__INVALID_VAULT_WINNINGS_ACCOUNT = 0x1771; // 6001
/** InvalidAdmin: Invalid admin */
export const SANTA_VS_GRINCH_ERROR__INVALID_ADMIN = 0x1772; // 6002
/** InvalidBetSide: Invalid bet side */
export const SANTA_VS_GRINCH_ERROR__INVALID_BET_SIDE = 0x1773; // 6003
/** InvalidFeesVaultDepositAccount: Invalid fees vault account */
export const SANTA_VS_GRINCH_ERROR__INVALID_FEES_VAULT_DEPOSIT_ACCOUNT = 0x1774; // 6004
/** InvalidPercentage: Invalid Percentage */
export const SANTA_VS_GRINCH_ERROR__INVALID_PERCENTAGE = 0x1775; // 6005
/** GameEnded: Game has already ended */
export const SANTA_VS_GRINCH_ERROR__GAME_ENDED = 0x1776; // 6006
/** GameNotEnded: Game has not ended yet */
export const SANTA_VS_GRINCH_ERROR__GAME_NOT_ENDED = 0x1777; // 6007
/** AlreadyClaimed: User has already claimed */
export const SANTA_VS_GRINCH_ERROR__ALREADY_CLAIMED = 0x1778; // 6008
/** InvalidTotalShares: Invalid total shares */
export const SANTA_VS_GRINCH_ERROR__INVALID_TOTAL_SHARES = 0x1779; // 6009
/** TooManyCreators: Too Many Creators */
export const SANTA_VS_GRINCH_ERROR__TOO_MANY_CREATORS = 0x177a; // 6010
/** InvalidCreatorAddress: InvalidCreatorAddress */
export const SANTA_VS_GRINCH_ERROR__INVALID_CREATOR_ADDRESS = 0x177b; // 6011
/** InvalidBetTag: InvalidBetTag */
export const SANTA_VS_GRINCH_ERROR__INVALID_BET_TAG = 0x177c; // 6012

export type SantaVsGrinchError =
  | typeof SANTA_VS_GRINCH_ERROR__ALREADY_CLAIMED
  | typeof SANTA_VS_GRINCH_ERROR__GAME_ENDED
  | typeof SANTA_VS_GRINCH_ERROR__GAME_NOT_ENDED
  | typeof SANTA_VS_GRINCH_ERROR__INVALID_ADMIN
  | typeof SANTA_VS_GRINCH_ERROR__INVALID_BET_SIDE
  | typeof SANTA_VS_GRINCH_ERROR__INVALID_BET_TAG
  | typeof SANTA_VS_GRINCH_ERROR__INVALID_CREATOR_ADDRESS
  | typeof SANTA_VS_GRINCH_ERROR__INVALID_FEES_VAULT_DEPOSIT_ACCOUNT
  | typeof SANTA_VS_GRINCH_ERROR__INVALID_PERCENTAGE
  | typeof SANTA_VS_GRINCH_ERROR__INVALID_TOTAL_SHARES
  | typeof SANTA_VS_GRINCH_ERROR__INVALID_VAULT_DEPOSIT_ACCOUNT
  | typeof SANTA_VS_GRINCH_ERROR__INVALID_VAULT_WINNINGS_ACCOUNT
  | typeof SANTA_VS_GRINCH_ERROR__TOO_MANY_CREATORS;

let santaVsGrinchErrorMessages: Record<SantaVsGrinchError, string> | undefined;
if (process.env.NODE_ENV !== 'production') {
  santaVsGrinchErrorMessages = {
    [SANTA_VS_GRINCH_ERROR__ALREADY_CLAIMED]: `User has already claimed`,
    [SANTA_VS_GRINCH_ERROR__GAME_ENDED]: `Game has already ended`,
    [SANTA_VS_GRINCH_ERROR__GAME_NOT_ENDED]: `Game has not ended yet`,
    [SANTA_VS_GRINCH_ERROR__INVALID_ADMIN]: `Invalid admin`,
    [SANTA_VS_GRINCH_ERROR__INVALID_BET_SIDE]: `Invalid bet side`,
    [SANTA_VS_GRINCH_ERROR__INVALID_BET_TAG]: `InvalidBetTag`,
    [SANTA_VS_GRINCH_ERROR__INVALID_CREATOR_ADDRESS]: `InvalidCreatorAddress`,
    [SANTA_VS_GRINCH_ERROR__INVALID_FEES_VAULT_DEPOSIT_ACCOUNT]: `Invalid fees vault account`,
    [SANTA_VS_GRINCH_ERROR__INVALID_PERCENTAGE]: `Invalid Percentage`,
    [SANTA_VS_GRINCH_ERROR__INVALID_TOTAL_SHARES]: `Invalid total shares`,
    [SANTA_VS_GRINCH_ERROR__INVALID_VAULT_DEPOSIT_ACCOUNT]: `Invalid deposit vault account`,
    [SANTA_VS_GRINCH_ERROR__INVALID_VAULT_WINNINGS_ACCOUNT]: `Invalid winnings vault account`,
    [SANTA_VS_GRINCH_ERROR__TOO_MANY_CREATORS]: `Too Many Creators`,
  };
}

export function getSantaVsGrinchErrorMessage(code: SantaVsGrinchError): string {
  if (process.env.NODE_ENV !== 'production') {
    return (santaVsGrinchErrorMessages as Record<SantaVsGrinchError, string>)[
      code
    ];
  }

  return 'Error message not available in production bundles.';
}

export function isSantaVsGrinchError<
  TProgramErrorCode extends SantaVsGrinchError,
>(
  error: unknown,
  transactionMessage: {
    instructions: Record<number, { programAddress: Address }>;
  },
  code?: TProgramErrorCode
): error is SolanaError<typeof SOLANA_ERROR__INSTRUCTION_ERROR__CUSTOM> &
  Readonly<{ context: Readonly<{ code: TProgramErrorCode }> }> {
  return isProgramError<TProgramErrorCode>(
    error,
    transactionMessage,
    SANTA_VS_GRINCH_PROGRAM_ADDRESS,
    code
  );
}
