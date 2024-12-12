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
  struct,
} from '@metaplex-foundation/umi/serializers';
import {
  ResolvedAccount,
  ResolvedAccountsWithIndices,
  getAccountMetasAndSigners,
} from '../shared';

// Accounts.
export type EndGameInstructionAccounts = {
  admin: Signer;
  state: PublicKey | Pda;
  systemProgram?: PublicKey | Pda;
};

// Data.
export type EndGameInstructionData = { discriminator: Uint8Array };

export type EndGameInstructionDataArgs = {};

export function getEndGameInstructionDataSerializer(): Serializer<
  EndGameInstructionDataArgs,
  EndGameInstructionData
> {
  return mapSerializer<EndGameInstructionDataArgs, any, EndGameInstructionData>(
    struct<EndGameInstructionData>([['discriminator', bytes({ size: 8 })]], {
      description: 'EndGameInstructionData',
    }),
    (value) => ({
      ...value,
      discriminator: new Uint8Array([224, 135, 245, 99, 67, 175, 121, 252]),
    })
  ) as Serializer<EndGameInstructionDataArgs, EndGameInstructionData>;
}

// Instruction.
export function endGame(
  context: Pick<Context, 'programs'>,
  input: EndGameInstructionAccounts
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
    systemProgram: {
      index: 2,
      isWritable: false as boolean,
      value: input.systemProgram ?? null,
    },
  } satisfies ResolvedAccountsWithIndices;

  // Default values.
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
  const data = getEndGameInstructionDataSerializer().serialize({});

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return transactionBuilder([
    { instruction: { keys, programId, data }, signers, bytesCreatedOnChain },
  ]);
}
