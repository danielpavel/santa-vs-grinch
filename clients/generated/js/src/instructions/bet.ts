/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/kinobi-so/kinobi
 */

import {
  addDecoderSizePrefix,
  addEncoderSizePrefix,
  combineCodec,
  fixDecoderSize,
  fixEncoderSize,
  getAddressEncoder,
  getBytesDecoder,
  getBytesEncoder,
  getProgramDerivedAddress,
  getStructDecoder,
  getStructEncoder,
  getU32Decoder,
  getU32Encoder,
  getU64Decoder,
  getU64Encoder,
  getUtf8Decoder,
  getUtf8Encoder,
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
  expectSome,
  getAccountMetaFactory,
  type ResolvedAccount,
} from '../shared';

export const BET_DISCRIMINATOR = new Uint8Array([
  94, 203, 166, 126, 20, 243, 169, 82,
]);

export function getBetDiscriminatorBytes() {
  return fixEncoderSize(getBytesEncoder(), 8).encode(BET_DISCRIMINATOR);
}

export type BetInstruction<
  TProgram extends string = typeof SANTA_VS_GRINCH_PROGRAM_ADDRESS,
  TAccountUser extends string | IAccountMeta<string> = string,
  TAccountMint extends string | IAccountMeta<string> = string,
  TAccountState extends string | IAccountMeta<string> = string,
  TAccountVault extends string | IAccountMeta<string> = string,
  TAccountFeesVault extends string | IAccountMeta<string> = string,
  TAccountUserBet extends string | IAccountMeta<string> = string,
  TAccountUserAta extends string | IAccountMeta<string> = string,
  TAccountTokenProgram extends string | IAccountMeta<string> = string,
  TAccountAssociatedTokenProgram extends
    | string
    | IAccountMeta<string> = 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
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
      TAccountMint extends string
        ? ReadonlyAccount<TAccountMint>
        : TAccountMint,
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
      TAccountUserAta extends string
        ? WritableAccount<TAccountUserAta>
        : TAccountUserAta,
      TAccountTokenProgram extends string
        ? ReadonlyAccount<TAccountTokenProgram>
        : TAccountTokenProgram,
      TAccountAssociatedTokenProgram extends string
        ? ReadonlyAccount<TAccountAssociatedTokenProgram>
        : TAccountAssociatedTokenProgram,
      TAccountSystemProgram extends string
        ? ReadonlyAccount<TAccountSystemProgram>
        : TAccountSystemProgram,
      ...TRemainingAccounts,
    ]
  >;

export type BetInstructionData = {
  discriminator: ReadonlyUint8Array;
  amount: bigint;
  betTag: string;
};

export type BetInstructionDataArgs = {
  amount: number | bigint;
  betTag: string;
};

export function getBetInstructionDataEncoder(): Encoder<BetInstructionDataArgs> {
  return transformEncoder(
    getStructEncoder([
      ['discriminator', fixEncoderSize(getBytesEncoder(), 8)],
      ['amount', getU64Encoder()],
      ['betTag', addEncoderSizePrefix(getUtf8Encoder(), getU32Encoder())],
    ]),
    (value) => ({ ...value, discriminator: BET_DISCRIMINATOR })
  );
}

export function getBetInstructionDataDecoder(): Decoder<BetInstructionData> {
  return getStructDecoder([
    ['discriminator', fixDecoderSize(getBytesDecoder(), 8)],
    ['amount', getU64Decoder()],
    ['betTag', addDecoderSizePrefix(getUtf8Decoder(), getU32Decoder())],
  ]);
}

export function getBetInstructionDataCodec(): Codec<
  BetInstructionDataArgs,
  BetInstructionData
> {
  return combineCodec(
    getBetInstructionDataEncoder(),
    getBetInstructionDataDecoder()
  );
}

export type BetAsyncInput<
  TAccountUser extends string = string,
  TAccountMint extends string = string,
  TAccountState extends string = string,
  TAccountVault extends string = string,
  TAccountFeesVault extends string = string,
  TAccountUserBet extends string = string,
  TAccountUserAta extends string = string,
  TAccountTokenProgram extends string = string,
  TAccountAssociatedTokenProgram extends string = string,
  TAccountSystemProgram extends string = string,
> = {
  user: TransactionSigner<TAccountUser>;
  mint: Address<TAccountMint>;
  state: Address<TAccountState>;
  vault?: Address<TAccountVault>;
  feesVault?: Address<TAccountFeesVault>;
  userBet?: Address<TAccountUserBet>;
  userAta: Address<TAccountUserAta>;
  tokenProgram: Address<TAccountTokenProgram>;
  associatedTokenProgram?: Address<TAccountAssociatedTokenProgram>;
  systemProgram?: Address<TAccountSystemProgram>;
  amount: BetInstructionDataArgs['amount'];
  betTag: BetInstructionDataArgs['betTag'];
};

export async function getBetInstructionAsync<
  TAccountUser extends string,
  TAccountMint extends string,
  TAccountState extends string,
  TAccountVault extends string,
  TAccountFeesVault extends string,
  TAccountUserBet extends string,
  TAccountUserAta extends string,
  TAccountTokenProgram extends string,
  TAccountAssociatedTokenProgram extends string,
  TAccountSystemProgram extends string,
  TProgramAddress extends Address = typeof SANTA_VS_GRINCH_PROGRAM_ADDRESS,
>(
  input: BetAsyncInput<
    TAccountUser,
    TAccountMint,
    TAccountState,
    TAccountVault,
    TAccountFeesVault,
    TAccountUserBet,
    TAccountUserAta,
    TAccountTokenProgram,
    TAccountAssociatedTokenProgram,
    TAccountSystemProgram
  >,
  config?: { programAddress?: TProgramAddress }
): Promise<
  BetInstruction<
    TProgramAddress,
    TAccountUser,
    TAccountMint,
    TAccountState,
    TAccountVault,
    TAccountFeesVault,
    TAccountUserBet,
    TAccountUserAta,
    TAccountTokenProgram,
    TAccountAssociatedTokenProgram,
    TAccountSystemProgram
  >
> {
  // Program address.
  const programAddress =
    config?.programAddress ?? SANTA_VS_GRINCH_PROGRAM_ADDRESS;

  // Original accounts.
  const originalAccounts = {
    user: { value: input.user ?? null, isWritable: true },
    mint: { value: input.mint ?? null, isWritable: false },
    state: { value: input.state ?? null, isWritable: true },
    vault: { value: input.vault ?? null, isWritable: true },
    feesVault: { value: input.feesVault ?? null, isWritable: true },
    userBet: { value: input.userBet ?? null, isWritable: true },
    userAta: { value: input.userAta ?? null, isWritable: true },
    tokenProgram: { value: input.tokenProgram ?? null, isWritable: false },
    associatedTokenProgram: {
      value: input.associatedTokenProgram ?? null,
      isWritable: false,
    },
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
  if (!accounts.feesVault.value) {
    accounts.feesVault.value = await getProgramDerivedAddress({
      programAddress,
      seeds: [
        getBytesEncoder().encode(new Uint8Array([118, 97, 117, 108, 116])),
        getAddressEncoder().encode(expectAddress(accounts.state.value)),
        getBytesEncoder().encode(new Uint8Array([102, 101, 101, 115])),
      ],
    });
  }
  if (!accounts.userBet.value) {
    accounts.userBet.value = await getProgramDerivedAddress({
      programAddress,
      seeds: [
        getBytesEncoder().encode(new Uint8Array([117, 115, 101, 114])),
        getAddressEncoder().encode(expectAddress(accounts.user.value)),
        addEncoderSizePrefix(getUtf8Encoder(), getU32Encoder()).encode(
          expectSome(args.betTag)
        ),
      ],
    });
  }
  if (!accounts.associatedTokenProgram.value) {
    accounts.associatedTokenProgram.value =
      'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL' as Address<'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'>;
  }
  if (!accounts.systemProgram.value) {
    accounts.systemProgram.value =
      '11111111111111111111111111111111' as Address<'11111111111111111111111111111111'>;
  }

  const getAccountMeta = getAccountMetaFactory(programAddress, 'programId');
  const instruction = {
    accounts: [
      getAccountMeta(accounts.user),
      getAccountMeta(accounts.mint),
      getAccountMeta(accounts.state),
      getAccountMeta(accounts.vault),
      getAccountMeta(accounts.feesVault),
      getAccountMeta(accounts.userBet),
      getAccountMeta(accounts.userAta),
      getAccountMeta(accounts.tokenProgram),
      getAccountMeta(accounts.associatedTokenProgram),
      getAccountMeta(accounts.systemProgram),
    ],
    programAddress,
    data: getBetInstructionDataEncoder().encode(args as BetInstructionDataArgs),
  } as BetInstruction<
    TProgramAddress,
    TAccountUser,
    TAccountMint,
    TAccountState,
    TAccountVault,
    TAccountFeesVault,
    TAccountUserBet,
    TAccountUserAta,
    TAccountTokenProgram,
    TAccountAssociatedTokenProgram,
    TAccountSystemProgram
  >;

  return instruction;
}

export type BetInput<
  TAccountUser extends string = string,
  TAccountMint extends string = string,
  TAccountState extends string = string,
  TAccountVault extends string = string,
  TAccountFeesVault extends string = string,
  TAccountUserBet extends string = string,
  TAccountUserAta extends string = string,
  TAccountTokenProgram extends string = string,
  TAccountAssociatedTokenProgram extends string = string,
  TAccountSystemProgram extends string = string,
> = {
  user: TransactionSigner<TAccountUser>;
  mint: Address<TAccountMint>;
  state: Address<TAccountState>;
  vault: Address<TAccountVault>;
  feesVault: Address<TAccountFeesVault>;
  userBet: Address<TAccountUserBet>;
  userAta: Address<TAccountUserAta>;
  tokenProgram: Address<TAccountTokenProgram>;
  associatedTokenProgram?: Address<TAccountAssociatedTokenProgram>;
  systemProgram?: Address<TAccountSystemProgram>;
  amount: BetInstructionDataArgs['amount'];
  betTag: BetInstructionDataArgs['betTag'];
};

export function getBetInstruction<
  TAccountUser extends string,
  TAccountMint extends string,
  TAccountState extends string,
  TAccountVault extends string,
  TAccountFeesVault extends string,
  TAccountUserBet extends string,
  TAccountUserAta extends string,
  TAccountTokenProgram extends string,
  TAccountAssociatedTokenProgram extends string,
  TAccountSystemProgram extends string,
  TProgramAddress extends Address = typeof SANTA_VS_GRINCH_PROGRAM_ADDRESS,
>(
  input: BetInput<
    TAccountUser,
    TAccountMint,
    TAccountState,
    TAccountVault,
    TAccountFeesVault,
    TAccountUserBet,
    TAccountUserAta,
    TAccountTokenProgram,
    TAccountAssociatedTokenProgram,
    TAccountSystemProgram
  >,
  config?: { programAddress?: TProgramAddress }
): BetInstruction<
  TProgramAddress,
  TAccountUser,
  TAccountMint,
  TAccountState,
  TAccountVault,
  TAccountFeesVault,
  TAccountUserBet,
  TAccountUserAta,
  TAccountTokenProgram,
  TAccountAssociatedTokenProgram,
  TAccountSystemProgram
> {
  // Program address.
  const programAddress =
    config?.programAddress ?? SANTA_VS_GRINCH_PROGRAM_ADDRESS;

  // Original accounts.
  const originalAccounts = {
    user: { value: input.user ?? null, isWritable: true },
    mint: { value: input.mint ?? null, isWritable: false },
    state: { value: input.state ?? null, isWritable: true },
    vault: { value: input.vault ?? null, isWritable: true },
    feesVault: { value: input.feesVault ?? null, isWritable: true },
    userBet: { value: input.userBet ?? null, isWritable: true },
    userAta: { value: input.userAta ?? null, isWritable: true },
    tokenProgram: { value: input.tokenProgram ?? null, isWritable: false },
    associatedTokenProgram: {
      value: input.associatedTokenProgram ?? null,
      isWritable: false,
    },
    systemProgram: { value: input.systemProgram ?? null, isWritable: false },
  };
  const accounts = originalAccounts as Record<
    keyof typeof originalAccounts,
    ResolvedAccount
  >;

  // Original args.
  const args = { ...input };

  // Resolve default values.
  if (!accounts.associatedTokenProgram.value) {
    accounts.associatedTokenProgram.value =
      'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL' as Address<'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'>;
  }
  if (!accounts.systemProgram.value) {
    accounts.systemProgram.value =
      '11111111111111111111111111111111' as Address<'11111111111111111111111111111111'>;
  }

  const getAccountMeta = getAccountMetaFactory(programAddress, 'programId');
  const instruction = {
    accounts: [
      getAccountMeta(accounts.user),
      getAccountMeta(accounts.mint),
      getAccountMeta(accounts.state),
      getAccountMeta(accounts.vault),
      getAccountMeta(accounts.feesVault),
      getAccountMeta(accounts.userBet),
      getAccountMeta(accounts.userAta),
      getAccountMeta(accounts.tokenProgram),
      getAccountMeta(accounts.associatedTokenProgram),
      getAccountMeta(accounts.systemProgram),
    ],
    programAddress,
    data: getBetInstructionDataEncoder().encode(args as BetInstructionDataArgs),
  } as BetInstruction<
    TProgramAddress,
    TAccountUser,
    TAccountMint,
    TAccountState,
    TAccountVault,
    TAccountFeesVault,
    TAccountUserBet,
    TAccountUserAta,
    TAccountTokenProgram,
    TAccountAssociatedTokenProgram,
    TAccountSystemProgram
  >;

  return instruction;
}

export type ParsedBetInstruction<
  TProgram extends string = typeof SANTA_VS_GRINCH_PROGRAM_ADDRESS,
  TAccountMetas extends readonly IAccountMeta[] = readonly IAccountMeta[],
> = {
  programAddress: Address<TProgram>;
  accounts: {
    user: TAccountMetas[0];
    mint: TAccountMetas[1];
    state: TAccountMetas[2];
    vault: TAccountMetas[3];
    feesVault: TAccountMetas[4];
    userBet: TAccountMetas[5];
    userAta: TAccountMetas[6];
    tokenProgram: TAccountMetas[7];
    associatedTokenProgram: TAccountMetas[8];
    systemProgram: TAccountMetas[9];
  };
  data: BetInstructionData;
};

export function parseBetInstruction<
  TProgram extends string,
  TAccountMetas extends readonly IAccountMeta[],
>(
  instruction: IInstruction<TProgram> &
    IInstructionWithAccounts<TAccountMetas> &
    IInstructionWithData<Uint8Array>
): ParsedBetInstruction<TProgram, TAccountMetas> {
  if (instruction.accounts.length < 10) {
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
      mint: getNextAccount(),
      state: getNextAccount(),
      vault: getNextAccount(),
      feesVault: getNextAccount(),
      userBet: getNextAccount(),
      userAta: getNextAccount(),
      tokenProgram: getNextAccount(),
      associatedTokenProgram: getNextAccount(),
      systemProgram: getNextAccount(),
    },
    data: getBetInstructionDataDecoder().decode(instruction.data),
  };
}
