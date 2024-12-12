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
  getAddressEncoder,
  getBytesDecoder,
  getBytesEncoder,
  getProgramDerivedAddress,
  getStructDecoder,
  getStructEncoder,
  getU64Decoder,
  getU64Encoder,
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
import {
  expectAddress,
  getAccountMetaFactory,
  type ResolvedAccount,
} from '../shared';
import {
  getBettingSideDecoder,
  getBettingSideEncoder,
  type BettingSide,
  type BettingSideArgs,
} from '../types';

export const DEPOSIT_DISCRIMINATOR = new Uint8Array([
  242, 35, 198, 137, 82, 225, 242, 182,
]);

export function getDepositDiscriminatorBytes() {
  return fixEncoderSize(getBytesEncoder(), 8).encode(DEPOSIT_DISCRIMINATOR);
}

export type DepositInstruction<
  TProgram extends string = typeof SANTA_VS_GRINCH_PROGRAM_ADDRESS,
  TAccountUser extends string | IAccountMeta<string> = string,
  TAccountState extends string | IAccountMeta<string> = string,
  TAccountVault extends string | IAccountMeta<string> = string,
  TAccountFeesVault extends string | IAccountMeta<string> = string,
  TAccountUserBet extends string | IAccountMeta<string> = string,
  TAccountSystemProgram extends
    | string
    | IAccountMeta<string> = '11111111111111111111111111111111',
  TRemainingAccounts extends readonly IAccountMeta<string>[] = [],
> = IInstruction<TProgram> &
  IInstructionWithData<Uint8Array> &
  IInstructionWithAccounts<
    [
      TAccountUser extends string
        ? WritableSignerAccount<TAccountUser> & IAccountSignerMeta<TAccountUser>
        : TAccountUser,
      TAccountState extends string
        ? WritableAccount<TAccountState>
        : TAccountState,
      TAccountVault extends string
        ? WritableAccount<TAccountVault>
        : TAccountVault,
      TAccountFeesVault extends string
        ? WritableAccount<TAccountFeesVault>
        : TAccountFeesVault,
      TAccountUserBet extends string
        ? WritableAccount<TAccountUserBet>
        : TAccountUserBet,
      TAccountSystemProgram extends string
        ? ReadonlyAccount<TAccountSystemProgram>
        : TAccountSystemProgram,
      ...TRemainingAccounts,
    ]
  >;

export type DepositInstructionData = {
  discriminator: ReadonlyUint8Array;
  amount: bigint;
  betSide: BettingSide;
};

export type DepositInstructionDataArgs = {
  amount: number | bigint;
  betSide: BettingSideArgs;
};

export function getDepositInstructionDataEncoder(): Encoder<DepositInstructionDataArgs> {
  return transformEncoder(
    getStructEncoder([
      ['discriminator', fixEncoderSize(getBytesEncoder(), 8)],
      ['amount', getU64Encoder()],
      ['betSide', getBettingSideEncoder()],
    ]),
    (value) => ({ ...value, discriminator: DEPOSIT_DISCRIMINATOR })
  );
}

export function getDepositInstructionDataDecoder(): Decoder<DepositInstructionData> {
  return getStructDecoder([
    ['discriminator', fixDecoderSize(getBytesDecoder(), 8)],
    ['amount', getU64Decoder()],
    ['betSide', getBettingSideDecoder()],
  ]);
}

export function getDepositInstructionDataCodec(): Codec<
  DepositInstructionDataArgs,
  DepositInstructionData
> {
  return combineCodec(
    getDepositInstructionDataEncoder(),
    getDepositInstructionDataDecoder()
  );
}

export type DepositAsyncInput<
  TAccountUser extends string = string,
  TAccountState extends string = string,
  TAccountVault extends string = string,
  TAccountFeesVault extends string = string,
  TAccountUserBet extends string = string,
  TAccountSystemProgram extends string = string,
> = {
  user: TransactionSigner<TAccountUser>;
  state: Address<TAccountState>;
  vault?: Address<TAccountVault>;
  feesVault: Address<TAccountFeesVault>;
  userBet?: Address<TAccountUserBet>;
  systemProgram?: Address<TAccountSystemProgram>;
  amount: DepositInstructionDataArgs['amount'];
  betSide: DepositInstructionDataArgs['betSide'];
};

export async function getDepositInstructionAsync<
  TAccountUser extends string,
  TAccountState extends string,
  TAccountVault extends string,
  TAccountFeesVault extends string,
  TAccountUserBet extends string,
  TAccountSystemProgram extends string,
  TProgramAddress extends Address = typeof SANTA_VS_GRINCH_PROGRAM_ADDRESS,
>(
  input: DepositAsyncInput<
    TAccountUser,
    TAccountState,
    TAccountVault,
    TAccountFeesVault,
    TAccountUserBet,
    TAccountSystemProgram
  >,
  config?: { programAddress?: TProgramAddress }
): Promise<
  DepositInstruction<
    TProgramAddress,
    TAccountUser,
    TAccountState,
    TAccountVault,
    TAccountFeesVault,
    TAccountUserBet,
    TAccountSystemProgram
  >
> {
  // Program address.
  const programAddress =
    config?.programAddress ?? SANTA_VS_GRINCH_PROGRAM_ADDRESS;

  // Original accounts.
  const originalAccounts = {
    user: { value: input.user ?? null, isWritable: true },
    state: { value: input.state ?? null, isWritable: true },
    vault: { value: input.vault ?? null, isWritable: true },
    feesVault: { value: input.feesVault ?? null, isWritable: true },
    userBet: { value: input.userBet ?? null, isWritable: true },
    systemProgram: { value: input.systemProgram ?? null, isWritable: false },
  };
  const accounts = originalAccounts as Record<
    keyof typeof originalAccounts,
    ResolvedAccount
  >;

  // Original args.
  const args = { ...input };

  // Resolve default values.
  if (!accounts.vault.value) {
    accounts.vault.value = await getProgramDerivedAddress({
      programAddress,
      seeds: [
        getBytesEncoder().encode(new Uint8Array([118, 97, 117, 108, 116])),
        getAddressEncoder().encode(expectAddress(accounts.state.value)),
        getBytesEncoder().encode(
          new Uint8Array([
            115, 97, 110, 116, 97, 45, 118, 115, 45, 103, 114, 105, 110, 99,
            104,
          ])
        ),
      ],
    });
  }
  if (!accounts.userBet.value) {
    accounts.userBet.value = await getProgramDerivedAddress({
      programAddress,
      seeds: [
        getBytesEncoder().encode(new Uint8Array([117, 115, 101, 114])),
        getAddressEncoder().encode(expectAddress(accounts.user.value)),
      ],
    });
  }
  if (!accounts.systemProgram.value) {
    accounts.systemProgram.value =
      '11111111111111111111111111111111' as Address<'11111111111111111111111111111111'>;
  }

  const getAccountMeta = getAccountMetaFactory(programAddress, 'programId');
  const instruction = {
    accounts: [
      getAccountMeta(accounts.user),
      getAccountMeta(accounts.state),
      getAccountMeta(accounts.vault),
      getAccountMeta(accounts.feesVault),
      getAccountMeta(accounts.userBet),
      getAccountMeta(accounts.systemProgram),
    ],
    programAddress,
    data: getDepositInstructionDataEncoder().encode(
      args as DepositInstructionDataArgs
    ),
  } as DepositInstruction<
    TProgramAddress,
    TAccountUser,
    TAccountState,
    TAccountVault,
    TAccountFeesVault,
    TAccountUserBet,
    TAccountSystemProgram
  >;

  return instruction;
}

export type DepositInput<
  TAccountUser extends string = string,
  TAccountState extends string = string,
  TAccountVault extends string = string,
  TAccountFeesVault extends string = string,
  TAccountUserBet extends string = string,
  TAccountSystemProgram extends string = string,
> = {
  user: TransactionSigner<TAccountUser>;
  state: Address<TAccountState>;
  vault: Address<TAccountVault>;
  feesVault: Address<TAccountFeesVault>;
  userBet: Address<TAccountUserBet>;
  systemProgram?: Address<TAccountSystemProgram>;
  amount: DepositInstructionDataArgs['amount'];
  betSide: DepositInstructionDataArgs['betSide'];
};

export function getDepositInstruction<
  TAccountUser extends string,
  TAccountState extends string,
  TAccountVault extends string,
  TAccountFeesVault extends string,
  TAccountUserBet extends string,
  TAccountSystemProgram extends string,
  TProgramAddress extends Address = typeof SANTA_VS_GRINCH_PROGRAM_ADDRESS,
>(
  input: DepositInput<
    TAccountUser,
    TAccountState,
    TAccountVault,
    TAccountFeesVault,
    TAccountUserBet,
    TAccountSystemProgram
  >,
  config?: { programAddress?: TProgramAddress }
): DepositInstruction<
  TProgramAddress,
  TAccountUser,
  TAccountState,
  TAccountVault,
  TAccountFeesVault,
  TAccountUserBet,
  TAccountSystemProgram
> {
  // Program address.
  const programAddress =
    config?.programAddress ?? SANTA_VS_GRINCH_PROGRAM_ADDRESS;

  // Original accounts.
  const originalAccounts = {
    user: { value: input.user ?? null, isWritable: true },
    state: { value: input.state ?? null, isWritable: true },
    vault: { value: input.vault ?? null, isWritable: true },
    feesVault: { value: input.feesVault ?? null, isWritable: true },
    userBet: { value: input.userBet ?? null, isWritable: true },
    systemProgram: { value: input.systemProgram ?? null, isWritable: false },
  };
  const accounts = originalAccounts as Record<
    keyof typeof originalAccounts,
    ResolvedAccount
  >;

  // Original args.
  const args = { ...input };

  // Resolve default values.
  if (!accounts.systemProgram.value) {
    accounts.systemProgram.value =
      '11111111111111111111111111111111' as Address<'11111111111111111111111111111111'>;
  }

  const getAccountMeta = getAccountMetaFactory(programAddress, 'programId');
  const instruction = {
    accounts: [
      getAccountMeta(accounts.user),
      getAccountMeta(accounts.state),
      getAccountMeta(accounts.vault),
      getAccountMeta(accounts.feesVault),
      getAccountMeta(accounts.userBet),
      getAccountMeta(accounts.systemProgram),
    ],
    programAddress,
    data: getDepositInstructionDataEncoder().encode(
      args as DepositInstructionDataArgs
    ),
  } as DepositInstruction<
    TProgramAddress,
    TAccountUser,
    TAccountState,
    TAccountVault,
    TAccountFeesVault,
    TAccountUserBet,
    TAccountSystemProgram
  >;

  return instruction;
}

export type ParsedDepositInstruction<
  TProgram extends string = typeof SANTA_VS_GRINCH_PROGRAM_ADDRESS,
  TAccountMetas extends readonly IAccountMeta[] = readonly IAccountMeta[],
> = {
  programAddress: Address<TProgram>;
  accounts: {
    user: TAccountMetas[0];
    state: TAccountMetas[1];
    vault: TAccountMetas[2];
    feesVault: TAccountMetas[3];
    userBet: TAccountMetas[4];
    systemProgram: TAccountMetas[5];
  };
  data: DepositInstructionData;
};

export function parseDepositInstruction<
  TProgram extends string,
  TAccountMetas extends readonly IAccountMeta[],
>(
  instruction: IInstruction<TProgram> &
    IInstructionWithAccounts<TAccountMetas> &
    IInstructionWithData<Uint8Array>
): ParsedDepositInstruction<TProgram, TAccountMetas> {
  if (instruction.accounts.length < 6) {
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
      user: getNextAccount(),
      state: getNextAccount(),
      vault: getNextAccount(),
      feesVault: getNextAccount(),
      userBet: getNextAccount(),
      systemProgram: getNextAccount(),
    },
    data: getDepositInstructionDataDecoder().decode(instruction.data),
  };
}