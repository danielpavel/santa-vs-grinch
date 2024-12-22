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
  u16,
} from '@metaplex-foundation/umi/serializers';
import {
  ResolvedAccount,
  ResolvedAccountsWithIndices,
  getAccountMetasAndSigners,
} from '../shared';

// Accounts.
export type UpdateBetBurnPercentageBpInstructionAccounts = {
  admin: Signer;
  state: PublicKey | Pda;
  systemProgram?: PublicKey | Pda;
};

// Data.
export type UpdateBetBurnPercentageBpInstructionData = {
  discriminator: Uint8Array;
  percentageInBp: number;
};

export type UpdateBetBurnPercentageBpInstructionDataArgs = {
  percentageInBp: number;
};

export function getUpdateBetBurnPercentageBpInstructionDataSerializer(): Serializer<
  UpdateBetBurnPercentageBpInstructionDataArgs,
  UpdateBetBurnPercentageBpInstructionData
> {
  return mapSerializer<
    UpdateBetBurnPercentageBpInstructionDataArgs,
    any,
    UpdateBetBurnPercentageBpInstructionData
  >(
    struct<UpdateBetBurnPercentageBpInstructionData>(
      [
        ['discriminator', bytes({ size: 8 })],
        ['percentageInBp', u16()],
      ],
      { description: 'UpdateBetBurnPercentageBpInstructionData' }
    ),
    (value) => ({
      ...value,
      discriminator: new Uint8Array([66, 140, 0, 157, 24, 57, 76, 30]),
    })
  ) as Serializer<
    UpdateBetBurnPercentageBpInstructionDataArgs,
    UpdateBetBurnPercentageBpInstructionData
  >;
}

// Args.
export type UpdateBetBurnPercentageBpInstructionArgs =
  UpdateBetBurnPercentageBpInstructionDataArgs;

// Instruction.
export function updateBetBurnPercentageBp(
  context: Pick<Context, 'programs'>,
  input: UpdateBetBurnPercentageBpInstructionAccounts &
    UpdateBetBurnPercentageBpInstructionArgs
): TransactionBuilder {
  // Program ID.
  const programId = context.programs.getPublicKey(
    'santaVsGrinch',
    '5Kox1zWxgz9oGXCYw65iGKAHYmiFov6FpPCib71NZ75x'
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

  // Arguments.
  const resolvedArgs: UpdateBetBurnPercentageBpInstructionArgs = { ...input };

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
  const data =
    getUpdateBetBurnPercentageBpInstructionDataSerializer().serialize(
      resolvedArgs as UpdateBetBurnPercentageBpInstructionDataArgs
    );

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return transactionBuilder([
    { instruction: { keys, programId, data }, signers, bytesCreatedOnChain },
  ]);
}