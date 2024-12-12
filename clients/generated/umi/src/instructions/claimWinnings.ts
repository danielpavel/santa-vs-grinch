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
export type ClaimWinningsInstructionAccounts = {
  claimer: Signer;
  state: PublicKey | Pda;
  vault?: PublicKey | Pda;
  userBet?: PublicKey | Pda;
  systemProgram?: PublicKey | Pda;
};

// Data.
export type ClaimWinningsInstructionData = { discriminator: Uint8Array };

export type ClaimWinningsInstructionDataArgs = {};

export function getClaimWinningsInstructionDataSerializer(): Serializer<
  ClaimWinningsInstructionDataArgs,
  ClaimWinningsInstructionData
> {
  return mapSerializer<
    ClaimWinningsInstructionDataArgs,
    any,
    ClaimWinningsInstructionData
  >(
    struct<ClaimWinningsInstructionData>(
      [['discriminator', bytes({ size: 8 })]],
      { description: 'ClaimWinningsInstructionData' }
    ),
    (value) => ({
      ...value,
      discriminator: new Uint8Array([161, 215, 24, 59, 14, 236, 242, 221]),
    })
  ) as Serializer<
    ClaimWinningsInstructionDataArgs,
    ClaimWinningsInstructionData
  >;
}

// Instruction.
export function claimWinnings(
  context: Pick<Context, 'eddsa' | 'programs'>,
  input: ClaimWinningsInstructionAccounts
): TransactionBuilder {
  // Program ID.
  const programId = context.programs.getPublicKey(
    'santaVsGrinch',
    'BZGCW6asmdxFTxo1xNpgBPnX9Seb5oLfPDEy3QqLpPPE'
  );

  // Accounts.
  const resolvedAccounts = {
    claimer: {
      index: 0,
      isWritable: true as boolean,
      value: input.claimer ?? null,
    },
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
    userBet: {
      index: 3,
      isWritable: true as boolean,
      value: input.userBet ?? null,
    },
    systemProgram: {
      index: 4,
      isWritable: false as boolean,
      value: input.systemProgram ?? null,
    },
  } satisfies ResolvedAccountsWithIndices;

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
        expectPublicKey(resolvedAccounts.claimer.value)
      ),
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
  const data = getClaimWinningsInstructionDataSerializer().serialize({});

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return transactionBuilder([
    { instruction: { keys, programId, data }, signers, bytesCreatedOnChain },
  ]);
}
