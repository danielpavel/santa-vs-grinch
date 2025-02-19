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
  expectSome,
  getAccountMetaFactory,
  type ResolvedAccount,
} from '../shared';
import {
  getInitializeArgsDecoder,
  getInitializeArgsEncoder,
  type InitializeArgs,
  type InitializeArgsArgs,
} from '../types';

export const INITIALIZE_DISCRIMINATOR = new Uint8Array([
  175, 175, 109, 31, 13, 152, 155, 237,
]);

export function getInitializeDiscriminatorBytes() {
  return fixEncoderSize(getBytesEncoder(), 8).encode(INITIALIZE_DISCRIMINATOR);
}

export type InitializeInstruction<
  TProgram extends string = typeof SANTA_VS_GRINCH_PROGRAM_ADDRESS,
  TAccountAdmin extends string | IAccountMeta<string> = string,
  TAccountMint extends string | IAccountMeta<string> = string,
  TAccountState extends string | IAccountMeta<string> = string,
  TAccountVault extends string | IAccountMeta<string> = string,
  TAccountFeesVault extends string | IAccountMeta<string> = string,
  TAccountTokenProgram extends string | IAccountMeta<string> = string,
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
      TAccountMint extends string
        ? ReadonlyAccount<TAccountMint>
        : TAccountMint,
      TAccountState extends string
        ? WritableAccount<TAccountState>
        : TAccountState,
      TAccountVault extends string
        ? ReadonlyAccount<TAccountVault>
        : TAccountVault,
      TAccountFeesVault extends string
        ? WritableAccount<TAccountFeesVault>
        : TAccountFeesVault,
      TAccountTokenProgram extends string
        ? ReadonlyAccount<TAccountTokenProgram>
        : TAccountTokenProgram,
      TAccountSystemProgram extends string
        ? ReadonlyAccount<TAccountSystemProgram>
        : TAccountSystemProgram,
      ...TRemainingAccounts,
    ]
  >;

export type InitializeInstructionData = {
  discriminator: ReadonlyUint8Array;
  args: InitializeArgs;
  seed: bigint;
};

export type InitializeInstructionDataArgs = {
  args: InitializeArgsArgs;
  seed: number | bigint;
};

export function getInitializeInstructionDataEncoder(): Encoder<InitializeInstructionDataArgs> {
  return transformEncoder(
    getStructEncoder([
      ['discriminator', fixEncoderSize(getBytesEncoder(), 8)],
      ['args', getInitializeArgsEncoder()],
      ['seed', getU64Encoder()],
    ]),
    (value) => ({ ...value, discriminator: INITIALIZE_DISCRIMINATOR })
  );
}

export function getInitializeInstructionDataDecoder(): Decoder<InitializeInstructionData> {
  return getStructDecoder([
    ['discriminator', fixDecoderSize(getBytesDecoder(), 8)],
    ['args', getInitializeArgsDecoder()],
    ['seed', getU64Decoder()],
  ]);
}

export function getInitializeInstructionDataCodec(): Codec<
  InitializeInstructionDataArgs,
  InitializeInstructionData
> {
  return combineCodec(
    getInitializeInstructionDataEncoder(),
    getInitializeInstructionDataDecoder()
  );
}

export type InitializeAsyncInput<
  TAccountAdmin extends string = string,
  TAccountMint extends string = string,
  TAccountState extends string = string,
  TAccountVault extends string = string,
  TAccountFeesVault extends string = string,
  TAccountTokenProgram extends string = string,
  TAccountSystemProgram extends string = string,
> = {
  admin: TransactionSigner<TAccountAdmin>;
  mint: Address<TAccountMint>;
  state?: Address<TAccountState>;
  vault?: Address<TAccountVault>;
  feesVault?: Address<TAccountFeesVault>;
  tokenProgram: Address<TAccountTokenProgram>;
  systemProgram?: Address<TAccountSystemProgram>;
  args: InitializeInstructionDataArgs['args'];
  seed: InitializeInstructionDataArgs['seed'];
};

export async function getInitializeInstructionAsync<
  TAccountAdmin extends string,
  TAccountMint extends string,
  TAccountState extends string,
  TAccountVault extends string,
  TAccountFeesVault extends string,
  TAccountTokenProgram extends string,
  TAccountSystemProgram extends string,
  TProgramAddress extends Address = typeof SANTA_VS_GRINCH_PROGRAM_ADDRESS,
>(
  input: InitializeAsyncInput<
    TAccountAdmin,
    TAccountMint,
    TAccountState,
    TAccountVault,
    TAccountFeesVault,
    TAccountTokenProgram,
    TAccountSystemProgram
  >,
  config?: { programAddress?: TProgramAddress }
): Promise<
  InitializeInstruction<
    TProgramAddress,
    TAccountAdmin,
    TAccountMint,
    TAccountState,
    TAccountVault,
    TAccountFeesVault,
    TAccountTokenProgram,
    TAccountSystemProgram
  >
> {
  // Program address.
  const programAddress =
    config?.programAddress ?? SANTA_VS_GRINCH_PROGRAM_ADDRESS;

  // Original accounts.
  const originalAccounts = {
    admin: { value: input.admin ?? null, isWritable: true },
    mint: { value: input.mint ?? null, isWritable: false },
    state: { value: input.state ?? null, isWritable: true },
    vault: { value: input.vault ?? null, isWritable: false },
    feesVault: { value: input.feesVault ?? null, isWritable: true },
    tokenProgram: { value: input.tokenProgram ?? null, isWritable: false },
    systemProgram: { value: input.systemProgram ?? null, isWritable: false },
  };
  const accounts = originalAccounts as Record<
    keyof typeof originalAccounts,
    ResolvedAccount
  >;

  // Original args.
  const args = { ...input };

  // Resolve default values.
  if (!accounts.state.value) {
    accounts.state.value = await getProgramDerivedAddress({
      programAddress,
      seeds: [
        getBytesEncoder().encode(new Uint8Array([115, 116, 97, 116, 101])),
        getAddressEncoder().encode(expectAddress(accounts.admin.value)),
        getU64Encoder().encode(expectSome(args.seed)),
        getAddressEncoder().encode(expectAddress(accounts.mint.value)),
      ],
    });
  }
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
  if (!accounts.systemProgram.value) {
    accounts.systemProgram.value =
      '11111111111111111111111111111111' as Address<'11111111111111111111111111111111'>;
  }

  const getAccountMeta = getAccountMetaFactory(programAddress, 'programId');
  const instruction = {
    accounts: [
      getAccountMeta(accounts.admin),
      getAccountMeta(accounts.mint),
      getAccountMeta(accounts.state),
      getAccountMeta(accounts.vault),
      getAccountMeta(accounts.feesVault),
      getAccountMeta(accounts.tokenProgram),
      getAccountMeta(accounts.systemProgram),
    ],
    programAddress,
    data: getInitializeInstructionDataEncoder().encode(
      args as InitializeInstructionDataArgs
    ),
  } as InitializeInstruction<
    TProgramAddress,
    TAccountAdmin,
    TAccountMint,
    TAccountState,
    TAccountVault,
    TAccountFeesVault,
    TAccountTokenProgram,
    TAccountSystemProgram
  >;

  return instruction;
}

export type InitializeInput<
  TAccountAdmin extends string = string,
  TAccountMint extends string = string,
  TAccountState extends string = string,
  TAccountVault extends string = string,
  TAccountFeesVault extends string = string,
  TAccountTokenProgram extends string = string,
  TAccountSystemProgram extends string = string,
> = {
  admin: TransactionSigner<TAccountAdmin>;
  mint: Address<TAccountMint>;
  state: Address<TAccountState>;
  vault: Address<TAccountVault>;
  feesVault: Address<TAccountFeesVault>;
  tokenProgram: Address<TAccountTokenProgram>;
  systemProgram?: Address<TAccountSystemProgram>;
  args: InitializeInstructionDataArgs['args'];
  seed: InitializeInstructionDataArgs['seed'];
};

export function getInitializeInstruction<
  TAccountAdmin extends string,
  TAccountMint extends string,
  TAccountState extends string,
  TAccountVault extends string,
  TAccountFeesVault extends string,
  TAccountTokenProgram extends string,
  TAccountSystemProgram extends string,
  TProgramAddress extends Address = typeof SANTA_VS_GRINCH_PROGRAM_ADDRESS,
>(
  input: InitializeInput<
    TAccountAdmin,
    TAccountMint,
    TAccountState,
    TAccountVault,
    TAccountFeesVault,
    TAccountTokenProgram,
    TAccountSystemProgram
  >,
  config?: { programAddress?: TProgramAddress }
): InitializeInstruction<
  TProgramAddress,
  TAccountAdmin,
  TAccountMint,
  TAccountState,
  TAccountVault,
  TAccountFeesVault,
  TAccountTokenProgram,
  TAccountSystemProgram
> {
  // Program address.
  const programAddress =
    config?.programAddress ?? SANTA_VS_GRINCH_PROGRAM_ADDRESS;

  // Original accounts.
  const originalAccounts = {
    admin: { value: input.admin ?? null, isWritable: true },
    mint: { value: input.mint ?? null, isWritable: false },
    state: { value: input.state ?? null, isWritable: true },
    vault: { value: input.vault ?? null, isWritable: false },
    feesVault: { value: input.feesVault ?? null, isWritable: true },
    tokenProgram: { value: input.tokenProgram ?? null, isWritable: false },
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
      getAccountMeta(accounts.admin),
      getAccountMeta(accounts.mint),
      getAccountMeta(accounts.state),
      getAccountMeta(accounts.vault),
      getAccountMeta(accounts.feesVault),
      getAccountMeta(accounts.tokenProgram),
      getAccountMeta(accounts.systemProgram),
    ],
    programAddress,
    data: getInitializeInstructionDataEncoder().encode(
      args as InitializeInstructionDataArgs
    ),
  } as InitializeInstruction<
    TProgramAddress,
    TAccountAdmin,
    TAccountMint,
    TAccountState,
    TAccountVault,
    TAccountFeesVault,
    TAccountTokenProgram,
    TAccountSystemProgram
  >;

  return instruction;
}

export type ParsedInitializeInstruction<
  TProgram extends string = typeof SANTA_VS_GRINCH_PROGRAM_ADDRESS,
  TAccountMetas extends readonly IAccountMeta[] = readonly IAccountMeta[],
> = {
  programAddress: Address<TProgram>;
  accounts: {
    admin: TAccountMetas[0];
    mint: TAccountMetas[1];
    state: TAccountMetas[2];
    vault: TAccountMetas[3];
    feesVault: TAccountMetas[4];
    tokenProgram: TAccountMetas[5];
    systemProgram: TAccountMetas[6];
  };
  data: InitializeInstructionData;
};

export function parseInitializeInstruction<
  TProgram extends string,
  TAccountMetas extends readonly IAccountMeta[],
>(
  instruction: IInstruction<TProgram> &
    IInstructionWithAccounts<TAccountMetas> &
    IInstructionWithData<Uint8Array>
): ParsedInitializeInstruction<TProgram, TAccountMetas> {
  if (instruction.accounts.length < 7) {
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
      mint: getNextAccount(),
      state: getNextAccount(),
      vault: getNextAccount(),
      feesVault: getNextAccount(),
      tokenProgram: getNextAccount(),
      systemProgram: getNextAccount(),
    },
    data: getInitializeInstructionDataDecoder().decode(instruction.data),
  };
}
