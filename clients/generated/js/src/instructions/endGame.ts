/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/kinobi-so/kinobi
 */

import {
  combineCodec,
  fixDecoderSize,
  fixEncoderSize,
  getBytesDecoder,
  getBytesEncoder,
  getStructDecoder,
  getStructEncoder,
  transformEncoder,
  type Address,
  type Codec,
  type Decoder,
  type Encoder,
  type IAccountMeta,
  type IAccountSignerMeta,
  type IInstruction,
  type IInstructionWithAccounts,
  type IInstructionWithData,
  type ReadonlyAccount,
  type ReadonlyUint8Array,
  type TransactionSigner,
  type WritableAccount,
  type WritableSignerAccount,
} from '@solana/web3.js';
import { SANTA_VS_GRINCH_PROGRAM_ADDRESS } from '../programs';
import { getAccountMetaFactory, type ResolvedAccount } from '../shared';

export const END_GAME_DISCRIMINATOR = new Uint8Array([
  224, 135, 245, 99, 67, 175, 121, 252,
]);

export function getEndGameDiscriminatorBytes() {
  return fixEncoderSize(getBytesEncoder(), 8).encode(END_GAME_DISCRIMINATOR);
}

export type EndGameInstruction<
  TProgram extends string = typeof SANTA_VS_GRINCH_PROGRAM_ADDRESS,
  TAccountAdmin extends string | IAccountMeta<string> = string,
  TAccountState extends string | IAccountMeta<string> = string,
  TAccountSystemProgram extends
    | string
    | IAccountMeta<string> = '11111111111111111111111111111111',
  TRemainingAccounts extends readonly IAccountMeta<string>[] = [],
> = IInstruction<TProgram> &
  IInstructionWithData<Uint8Array> &
  IInstructionWithAccounts<
    [
      TAccountAdmin extends string
        ? WritableSignerAccount<TAccountAdmin> &
            IAccountSignerMeta<TAccountAdmin>
        : TAccountAdmin,
      TAccountState extends string
        ? WritableAccount<TAccountState>
        : TAccountState,
      TAccountSystemProgram extends string
        ? ReadonlyAccount<TAccountSystemProgram>
        : TAccountSystemProgram,
      ...TRemainingAccounts,
    ]
  >;

export type EndGameInstructionData = { discriminator: ReadonlyUint8Array };

export type EndGameInstructionDataArgs = {};

export function getEndGameInstructionDataEncoder(): Encoder<EndGameInstructionDataArgs> {
  return transformEncoder(
    getStructEncoder([['discriminator', fixEncoderSize(getBytesEncoder(), 8)]]),
    (value) => ({ ...value, discriminator: END_GAME_DISCRIMINATOR })
  );
}

export function getEndGameInstructionDataDecoder(): Decoder<EndGameInstructionData> {
  return getStructDecoder([
    ['discriminator', fixDecoderSize(getBytesDecoder(), 8)],
  ]);
}

export function getEndGameInstructionDataCodec(): Codec<
  EndGameInstructionDataArgs,
  EndGameInstructionData
> {
  return combineCodec(
    getEndGameInstructionDataEncoder(),
    getEndGameInstructionDataDecoder()
  );
}

export type EndGameInput<
  TAccountAdmin extends string = string,
  TAccountState extends string = string,
  TAccountSystemProgram extends string = string,
> = {
  admin: TransactionSigner<TAccountAdmin>;
  state: Address<TAccountState>;
  systemProgram?: Address<TAccountSystemProgram>;
};

export function getEndGameInstruction<
  TAccountAdmin extends string,
  TAccountState extends string,
  TAccountSystemProgram extends string,
  TProgramAddress extends Address = typeof SANTA_VS_GRINCH_PROGRAM_ADDRESS,
>(
  input: EndGameInput<TAccountAdmin, TAccountState, TAccountSystemProgram>,
  config?: { programAddress?: TProgramAddress }
): EndGameInstruction<
  TProgramAddress,
  TAccountAdmin,
  TAccountState,
  TAccountSystemProgram
> {
  // Program address.
  const programAddress =
    config?.programAddress ?? SANTA_VS_GRINCH_PROGRAM_ADDRESS;

  // Original accounts.
  const originalAccounts = {
    admin: { value: input.admin ?? null, isWritable: true },
    state: { value: input.state ?? null, isWritable: true },
    systemProgram: { value: input.systemProgram ?? null, isWritable: false },
  };
  const accounts = originalAccounts as Record<
    keyof typeof originalAccounts,
    ResolvedAccount
  >;

  // Resolve default values.
  if (!accounts.systemProgram.value) {
    accounts.systemProgram.value =
      '11111111111111111111111111111111' as Address<'11111111111111111111111111111111'>;
  }

  const getAccountMeta = getAccountMetaFactory(programAddress, 'programId');
  const instruction = {
    accounts: [
      getAccountMeta(accounts.admin),
      getAccountMeta(accounts.state),
      getAccountMeta(accounts.systemProgram),
    ],
    programAddress,
    data: getEndGameInstructionDataEncoder().encode({}),
  } as EndGameInstruction<
    TProgramAddress,
    TAccountAdmin,
    TAccountState,
    TAccountSystemProgram
  >;

  return instruction;
}

export type ParsedEndGameInstruction<
  TProgram extends string = typeof SANTA_VS_GRINCH_PROGRAM_ADDRESS,
  TAccountMetas extends readonly IAccountMeta[] = readonly IAccountMeta[],
> = {
  programAddress: Address<TProgram>;
  accounts: {
    admin: TAccountMetas[0];
    state: TAccountMetas[1];
    systemProgram: TAccountMetas[2];
  };
  data: EndGameInstructionData;
};

export function parseEndGameInstruction<
  TProgram extends string,
  TAccountMetas extends readonly IAccountMeta[],
>(
  instruction: IInstruction<TProgram> &
    IInstructionWithAccounts<TAccountMetas> &
    IInstructionWithData<Uint8Array>
): ParsedEndGameInstruction<TProgram, TAccountMetas> {
  if (instruction.accounts.length < 3) {
    // TODO: Coded error.
    throw new Error('Not enough accounts');
  }
  let accountIndex = 0;
  const getNextAccount = () => {
    const accountMeta = instruction.accounts![accountIndex]!;
    accountIndex += 1;
    return accountMeta;
  };
  return {
    programAddress: instruction.programAddress,
    accounts: {
      admin: getNextAccount(),
      state: getNextAccount(),
      systemProgram: getNextAccount(),
    },
    data: getEndGameInstructionDataDecoder().decode(instruction.data),
  };
}
