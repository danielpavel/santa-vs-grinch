/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/kinobi-so/kinobi
 */

import {
  Context,
  Pda,
  PublicKey,
  Signer,
  TransactionBuilder,
  transactionBuilder,
} from '@metaplex-foundation/umi';
import {
  Serializer,
  bytes,
  mapSerializer,
  publicKey as publicKeySerializer,
  string,
  struct,
  u64,
} from '@metaplex-foundation/umi/serializers';
import {
  ResolvedAccount,
  ResolvedAccountsWithIndices,
  expectPublicKey,
  expectSome,
  getAccountMetasAndSigners,
} from '../shared';

// Accounts.
export type BetInstructionAccounts = {
  user: Signer;
  state: PublicKey | Pda;
  vault?: PublicKey | Pda;
  feesVault: PublicKey | Pda;
  userBet?: PublicKey | Pda;
  systemProgram?: PublicKey | Pda;
};

// Data.
export type BetInstructionData = {
  discriminator: Uint8Array;
  amount: bigint;
  betTag: string;
};

export type BetInstructionDataArgs = {
  amount: number | bigint;
  betTag: string;
};

export function getBetInstructionDataSerializer(): Serializer<
  BetInstructionDataArgs,
  BetInstructionData
> {
  return mapSerializer<BetInstructionDataArgs, any, BetInstructionData>(
    struct<BetInstructionData>(
      [
        ['discriminator', bytes({ size: 8 })],
        ['amount', u64()],
        ['betTag', string()],
      ],
      { description: 'BetInstructionData' }
    ),
    (value) => ({
      ...value,
      discriminator: new Uint8Array([94, 203, 166, 126, 20, 243, 169, 82]),
    })
  ) as Serializer<BetInstructionDataArgs, BetInstructionData>;
}

// Args.
export type BetInstructionArgs = BetInstructionDataArgs;

// Instruction.
export function bet(
  context: Pick<Context, 'eddsa' | 'programs'>,
  input: BetInstructionAccounts & BetInstructionArgs
): TransactionBuilder {
  // Program ID.
  const programId = context.programs.getPublicKey(
    'santaVsGrinch',
    '5Kox1zWxgz9oGXCYw65iGKAHYmiFov6FpPCib71NZ75x'
  );

  // Accounts.
  const resolvedAccounts = {
    user: { index: 0, isWritable: true as boolean, value: input.user ?? null },
    state: {
      index: 1,
      isWritable: true as boolean,
      value: input.state ?? null,
    },
    vault: {
      index: 2,
      isWritable: true as boolean,
      value: input.vault ?? null,
    },
    feesVault: {
      index: 3,
      isWritable: true as boolean,
      value: input.feesVault ?? null,
    },
    userBet: {
      index: 4,
      isWritable: true as boolean,
      value: input.userBet ?? null,
    },
    systemProgram: {
      index: 5,
      isWritable: false as boolean,
      value: input.systemProgram ?? null,
    },
  } satisfies ResolvedAccountsWithIndices;

  // Arguments.
  const resolvedArgs: BetInstructionArgs = { ...input };

  // Default values.
  if (!resolvedAccounts.vault.value) {
    resolvedAccounts.vault.value = context.eddsa.findPda(programId, [
      bytes().serialize(new Uint8Array([118, 97, 117, 108, 116])),
      publicKeySerializer().serialize(
        expectPublicKey(resolvedAccounts.state.value)
      ),
      bytes().serialize(
        new Uint8Array([
          115, 97, 110, 116, 97, 45, 118, 115, 45, 103, 114, 105, 110, 99, 104,
        ])
      ),
    ]);
  }
  if (!resolvedAccounts.userBet.value) {
    resolvedAccounts.userBet.value = context.eddsa.findPda(programId, [
      bytes().serialize(new Uint8Array([117, 115, 101, 114])),
      publicKeySerializer().serialize(
        expectPublicKey(resolvedAccounts.user.value)
      ),
      string().serialize(expectSome(resolvedArgs.betTag)),
    ]);
  }
  if (!resolvedAccounts.systemProgram.value) {
    resolvedAccounts.systemProgram.value = context.programs.getPublicKey(
      'systemProgram',
      '11111111111111111111111111111111'
    );
    resolvedAccounts.systemProgram.isWritable = false;
  }

  // Accounts in order.
  const orderedAccounts: ResolvedAccount[] = Object.values(
    resolvedAccounts
  ).sort((a, b) => a.index - b.index);

  // Keys and Signers.
  const [keys, signers] = getAccountMetasAndSigners(
    orderedAccounts,
    'programId',
    programId
  );

  // Data.
  const data = getBetInstructionDataSerializer().serialize(
    resolvedArgs as BetInstructionDataArgs
  );

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return transactionBuilder([
    { instruction: { keys, programId, data }, signers, bytesCreatedOnChain },
  ]);
}
