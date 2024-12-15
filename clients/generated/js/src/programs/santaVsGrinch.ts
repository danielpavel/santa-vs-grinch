/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/kinobi-so/kinobi
 */

import {
  containsBytes,
  fixEncoderSize,
  getBytesEncoder,
  type Address,
  type ReadonlyUint8Array,
} from '@solana/web3.js';
import {
  type ParsedBetInstruction,
  type ParsedBuyMysteryBoxInstruction,
  type ParsedClaimWinningsInstruction,
  type ParsedEndGameInstruction,
  type ParsedInitializeInstruction,
  type ParsedUpdateWithdrawUnclaimedAtInstruction,
  type ParsedWithdrawCreatorsWinningsInstruction,
  type ParsedWithdrawFeesInstruction,
  type ParsedWithdrawUnclaimedCreatorsWinningsInstruction,
} from '../instructions';

export const SANTA_VS_GRINCH_PROGRAM_ADDRESS =
  '5Kox1zWxgz9oGXCYw65iGKAHYmiFov6FpPCib71NZ75x' as Address<'5Kox1zWxgz9oGXCYw65iGKAHYmiFov6FpPCib71NZ75x'>;

export enum SantaVsGrinchAccount {
  Config,
  UserBet,
}

export function identifySantaVsGrinchAccount(
  account: { data: ReadonlyUint8Array } | ReadonlyUint8Array
): SantaVsGrinchAccount {
  const data = 'data' in account ? account.data : account;
  if (
    containsBytes(
      data,
      fixEncoderSize(getBytesEncoder(), 8).encode(
        new Uint8Array([155, 12, 170, 224, 30, 250, 204, 130])
      ),
      0
    )
  ) {
    return SantaVsGrinchAccount.Config;
  }
  if (
    containsBytes(
      data,
      fixEncoderSize(getBytesEncoder(), 8).encode(
        new Uint8Array([180, 131, 8, 241, 60, 243, 46, 63])
      ),
      0
    )
  ) {
    return SantaVsGrinchAccount.UserBet;
  }
  throw new Error(
    'The provided account could not be identified as a santaVsGrinch account.'
  );
}

export enum SantaVsGrinchInstruction {
  Bet,
  BuyMysteryBox,
  ClaimWinnings,
  EndGame,
  Initialize,
  UpdateWithdrawUnclaimedAt,
  WithdrawCreatorsWinnings,
  WithdrawFees,
  WithdrawUnclaimedCreatorsWinnings,
}

export function identifySantaVsGrinchInstruction(
  instruction: { data: ReadonlyUint8Array } | ReadonlyUint8Array
): SantaVsGrinchInstruction {
  const data = 'data' in instruction ? instruction.data : instruction;
  if (
    containsBytes(
      data,
      fixEncoderSize(getBytesEncoder(), 8).encode(
        new Uint8Array([94, 203, 166, 126, 20, 243, 169, 82])
      ),
      0
    )
  ) {
    return SantaVsGrinchInstruction.Bet;
  }
  if (
    containsBytes(
      data,
      fixEncoderSize(getBytesEncoder(), 8).encode(
        new Uint8Array([150, 161, 180, 220, 54, 128, 128, 242])
      ),
      0
    )
  ) {
    return SantaVsGrinchInstruction.BuyMysteryBox;
  }
  if (
    containsBytes(
      data,
      fixEncoderSize(getBytesEncoder(), 8).encode(
        new Uint8Array([161, 215, 24, 59, 14, 236, 242, 221])
      ),
      0
    )
  ) {
    return SantaVsGrinchInstruction.ClaimWinnings;
  }
  if (
    containsBytes(
      data,
      fixEncoderSize(getBytesEncoder(), 8).encode(
        new Uint8Array([224, 135, 245, 99, 67, 175, 121, 252])
      ),
      0
    )
  ) {
    return SantaVsGrinchInstruction.EndGame;
  }
  if (
    containsBytes(
      data,
      fixEncoderSize(getBytesEncoder(), 8).encode(
        new Uint8Array([175, 175, 109, 31, 13, 152, 155, 237])
      ),
      0
    )
  ) {
    return SantaVsGrinchInstruction.Initialize;
  }
  if (
    containsBytes(
      data,
      fixEncoderSize(getBytesEncoder(), 8).encode(
        new Uint8Array([201, 9, 21, 79, 188, 80, 2, 89])
      ),
      0
    )
  ) {
    return SantaVsGrinchInstruction.UpdateWithdrawUnclaimedAt;
  }
  if (
    containsBytes(
      data,
      fixEncoderSize(getBytesEncoder(), 8).encode(
        new Uint8Array([210, 104, 160, 53, 155, 35, 222, 249])
      ),
      0
    )
  ) {
    return SantaVsGrinchInstruction.WithdrawCreatorsWinnings;
  }
  if (
    containsBytes(
      data,
      fixEncoderSize(getBytesEncoder(), 8).encode(
        new Uint8Array([198, 212, 171, 109, 144, 215, 174, 89])
      ),
      0
    )
  ) {
    return SantaVsGrinchInstruction.WithdrawFees;
  }
  if (
    containsBytes(
      data,
      fixEncoderSize(getBytesEncoder(), 8).encode(
        new Uint8Array([223, 124, 225, 226, 237, 254, 93, 105])
      ),
      0
    )
  ) {
    return SantaVsGrinchInstruction.WithdrawUnclaimedCreatorsWinnings;
  }
  throw new Error(
    'The provided instruction could not be identified as a santaVsGrinch instruction.'
  );
}

export type ParsedSantaVsGrinchInstruction<
  TProgram extends string = '5Kox1zWxgz9oGXCYw65iGKAHYmiFov6FpPCib71NZ75x',
> =
  | ({
      instructionType: SantaVsGrinchInstruction.Bet;
    } & ParsedBetInstruction<TProgram>)
  | ({
      instructionType: SantaVsGrinchInstruction.BuyMysteryBox;
    } & ParsedBuyMysteryBoxInstruction<TProgram>)
  | ({
      instructionType: SantaVsGrinchInstruction.ClaimWinnings;
    } & ParsedClaimWinningsInstruction<TProgram>)
  | ({
      instructionType: SantaVsGrinchInstruction.EndGame;
    } & ParsedEndGameInstruction<TProgram>)
  | ({
      instructionType: SantaVsGrinchInstruction.Initialize;
    } & ParsedInitializeInstruction<TProgram>)
  | ({
      instructionType: SantaVsGrinchInstruction.UpdateWithdrawUnclaimedAt;
    } & ParsedUpdateWithdrawUnclaimedAtInstruction<TProgram>)
  | ({
      instructionType: SantaVsGrinchInstruction.WithdrawCreatorsWinnings;
    } & ParsedWithdrawCreatorsWinningsInstruction<TProgram>)
  | ({
      instructionType: SantaVsGrinchInstruction.WithdrawFees;
    } & ParsedWithdrawFeesInstruction<TProgram>)
  | ({
      instructionType: SantaVsGrinchInstruction.WithdrawUnclaimedCreatorsWinnings;
    } & ParsedWithdrawUnclaimedCreatorsWinningsInstruction<TProgram>);
