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

// Accounts.
export type WithdrawFeesInstructionAccounts = {
  admin: Signer;
  state: PublicKey | Pda;
  feesVault?: PublicKey | Pda;
  systemProgram?: PublicKey | Pda;
};

// Data.
export type WithdrawFeesInstructionData = { discriminator: Uint8Array };

export type WithdrawFeesInstructionDataArgs = {};

export function getWithdrawFeesInstructionDataSerializer(): Serializer<
  WithdrawFeesInstructionDataArgs,
  WithdrawFeesInstructionData
> {
  return mapSerializer<
    WithdrawFeesInstructionDataArgs,
    any,
    WithdrawFeesInstructionData
  >(
    struct<WithdrawFeesInstructionData>(
      [['discriminator', bytes({ size: 8 })]],
      { description: 'WithdrawFeesInstructionData' }
    ),
    (value) => ({
      ...value,
      discriminator: new Uint8Array([198, 212, 171, 109, 144, 215, 174, 89]),
    })
  ) as Serializer<WithdrawFeesInstructionDataArgs, WithdrawFeesInstructionData>;
}

// Instruction.
export function withdrawFees(
  context: Pick<Context, 'eddsa' | 'programs'>,
  input: WithdrawFeesInstructionAccounts
): TransactionBuilder {
  // Program ID.
  const programId = context.programs.getPublicKey(
    'santaVsGrinch',
    'BZGCW6asmdxFTxo1xNpgBPnX9Seb5oLfPDEy3QqLpPPE'
  );

  // Accounts.
  const resolvedAccounts = {
    admin: {
      index: 0,
      isWritable: true as boolean,
      value: input.admin ?? null,
    },
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
  const data = getWithdrawFeesInstructionDataSerializer().serialize({});

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return transactionBuilder([
    { instruction: { keys, programId, data }, signers, bytesCreatedOnChain },
  ]);
}
