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
  type ParsedBetV2Instruction,
  type ParsedBuyMysteryBoxInstruction,
  type ParsedBuyMysteryBoxV2Instruction,
  type ParsedClaimWinningsInstruction,
  type ParsedClaimWinningsV2Instruction,
  type ParsedEndGameInstruction,
  type ParsedInitializeInstruction,
  type ParsedUpdateBetBuybackPercentageBpInstruction,
  type ParsedUpdateMysteryBoxBurnPercentageBpInstruction,
} from '../instructions';

export const SANTA_VS_GRINCH_PROGRAM_ADDRESS =
  'G1rm3S34YvLkGdPH994cAVHxiq2JsGrDhtwKMgQbignc' as Address<'G1rm3S34YvLkGdPH994cAVHxiq2JsGrDhtwKMgQbignc'>;

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
  BetV2,
  BuyMysteryBox,
  BuyMysteryBoxV2,
  ClaimWinnings,
  ClaimWinningsV2,
  EndGame,
  Initialize,
  UpdateBetBuybackPercentageBp,
  UpdateMysteryBoxBurnPercentageBp,
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
        new Uint8Array([5, 72, 133, 11, 203, 203, 149, 106])
      ),
      0
    )
  ) {
    return SantaVsGrinchInstruction.BetV2;
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
        new Uint8Array([103, 175, 214, 250, 179, 239, 126, 113])
      ),
      0
    )
  ) {
    return SantaVsGrinchInstruction.BuyMysteryBoxV2;
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
        new Uint8Array([184, 77, 105, 92, 126, 80, 168, 189])
      ),
      0
    )
  ) {
    return SantaVsGrinchInstruction.ClaimWinningsV2;
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
        new Uint8Array([110, 86, 101, 28, 23, 234, 136, 55])
      ),
      0
    )
  ) {
    return SantaVsGrinchInstruction.UpdateBetBuybackPercentageBp;
  }
  if (
    containsBytes(
      data,
      fixEncoderSize(getBytesEncoder(), 8).encode(
        new Uint8Array([64, 140, 239, 163, 43, 68, 59, 219])
      ),
      0
    )
  ) {
    return SantaVsGrinchInstruction.UpdateMysteryBoxBurnPercentageBp;
  }
  throw new Error(
    'The provided instruction could not be identified as a santaVsGrinch instruction.'
  );
}

export type ParsedSantaVsGrinchInstruction<
  TProgram extends string = 'G1rm3S34YvLkGdPH994cAVHxiq2JsGrDhtwKMgQbignc',
> =
  | ({
      instructionType: SantaVsGrinchInstruction.Bet;
    } & ParsedBetInstruction<TProgram>)
  | ({
      instructionType: SantaVsGrinchInstruction.BetV2;
    } & ParsedBetV2Instruction<TProgram>)
  | ({
      instructionType: SantaVsGrinchInstruction.BuyMysteryBox;
    } & ParsedBuyMysteryBoxInstruction<TProgram>)
  | ({
      instructionType: SantaVsGrinchInstruction.BuyMysteryBoxV2;
    } & ParsedBuyMysteryBoxV2Instruction<TProgram>)
  | ({
      instructionType: SantaVsGrinchInstruction.ClaimWinnings;
    } & ParsedClaimWinningsInstruction<TProgram>)
  | ({
      instructionType: SantaVsGrinchInstruction.ClaimWinningsV2;
    } & ParsedClaimWinningsV2Instruction<TProgram>)
  | ({
      instructionType: SantaVsGrinchInstruction.EndGame;
    } & ParsedEndGameInstruction<TProgram>)
  | ({
      instructionType: SantaVsGrinchInstruction.Initialize;
    } & ParsedInitializeInstruction<TProgram>)
  | ({
      instructionType: SantaVsGrinchInstruction.UpdateBetBuybackPercentageBp;
    } & ParsedUpdateBetBuybackPercentageBpInstruction<TProgram>)
  | ({
      instructionType: SantaVsGrinchInstruction.UpdateMysteryBoxBurnPercentageBp;
    } & ParsedUpdateMysteryBoxBurnPercentageBpInstruction<TProgram>);
