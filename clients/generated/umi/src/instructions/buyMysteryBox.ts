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
  struct,
} from '@metaplex-foundation/umi/serializers';
import {
  ResolvedAccount,
  ResolvedAccountsWithIndices,
  expectPublicKey,
  getAccountMetasAndSigners,
} from '../shared';
import {
  BettingSide,
  BettingSideArgs,
  getBettingSideSerializer,
} from '../types';

// Accounts.
export type BuyMysteryBoxInstructionAccounts = {
  user: Signer;
  state: PublicKey | Pda;
  feesVault?: PublicKey | Pda;
  systemProgram?: PublicKey | Pda;
};

// Data.
export type BuyMysteryBoxInstructionData = {
  discriminator: Uint8Array;
  side: BettingSide;
};

export type BuyMysteryBoxInstructionDataArgs = { side: BettingSideArgs };

export function getBuyMysteryBoxInstructionDataSerializer(): Serializer<
  BuyMysteryBoxInstructionDataArgs,
  BuyMysteryBoxInstructionData
> {
  return mapSerializer<
    BuyMysteryBoxInstructionDataArgs,
    any,
    BuyMysteryBoxInstructionData
  >(
    struct<BuyMysteryBoxInstructionData>(
      [
        ['discriminator', bytes({ size: 8 })],
        ['side', getBettingSideSerializer()],
      ],
      { description: 'BuyMysteryBoxInstructionData' }
    ),
    (value) => ({
      ...value,
      discriminator: new Uint8Array([150, 161, 180, 220, 54, 128, 128, 242]),
    })
  ) as Serializer<
    BuyMysteryBoxInstructionDataArgs,
    BuyMysteryBoxInstructionData
  >;
}

// Args.
export type BuyMysteryBoxInstructionArgs = BuyMysteryBoxInstructionDataArgs;

// Instruction.
export function buyMysteryBox(
  context: Pick<Context, 'eddsa' | 'programs'>,
  input: BuyMysteryBoxInstructionAccounts & BuyMysteryBoxInstructionArgs
): TransactionBuilder {
  // Program ID.
  const programId = context.programs.getPublicKey(
    'santaVsGrinch',
    'BZGCW6asmdxFTxo1xNpgBPnX9Seb5oLfPDEy3QqLpPPE'
  );

  // Accounts.
  const resolvedAccounts = {
    user: { index: 0, isWritable: true as boolean, value: input.user ?? null },
    state: {
      index: 1,
      isWritable: true as boolean,
      value: input.state ?? null,
    },
    feesVault: {
      index: 2,
      isWritable: true as boolean,
      value: input.feesVault ?? null,
    },
    systemProgram: {
      index: 3,
      isWritable: false as boolean,
      value: input.systemProgram ?? null,
    },
  } satisfies ResolvedAccountsWithIndices;

  // Arguments.
  const resolvedArgs: BuyMysteryBoxInstructionArgs = { ...input };

  // Default values.
  if (!resolvedAccounts.feesVault.value) {
    resolvedAccounts.feesVault.value = context.eddsa.findPda(programId, [
      bytes().serialize(new Uint8Array([118, 97, 117, 108, 116])),
      publicKeySerializer().serialize(
        expectPublicKey(resolvedAccounts.state.value)
      ),
      bytes().serialize(new Uint8Array([102, 101, 101, 115])),
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
  const data = getBuyMysteryBoxInstructionDataSerializer().serialize(
    resolvedArgs as BuyMysteryBoxInstructionDataArgs
  );

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return transactionBuilder([
    { instruction: { keys, programId, data }, signers, bytesCreatedOnChain },
  ]);
}
