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
export type WithdrawUnclaimedCreatorsWinningsInstructionAccounts = {
  admin: Signer;
  state: PublicKey | Pda;
  vault?: PublicKey | Pda;
  systemProgram?: PublicKey | Pda;
};

// Data.
export type WithdrawUnclaimedCreatorsWinningsInstructionData = {
  discriminator: Uint8Array;
};

export type WithdrawUnclaimedCreatorsWinningsInstructionDataArgs = {};

export function getWithdrawUnclaimedCreatorsWinningsInstructionDataSerializer(): Serializer<
  WithdrawUnclaimedCreatorsWinningsInstructionDataArgs,
  WithdrawUnclaimedCreatorsWinningsInstructionData
> {
  return mapSerializer<
    WithdrawUnclaimedCreatorsWinningsInstructionDataArgs,
    any,
    WithdrawUnclaimedCreatorsWinningsInstructionData
  >(
    struct<WithdrawUnclaimedCreatorsWinningsInstructionData>(
      [['discriminator', bytes({ size: 8 })]],
      { description: 'WithdrawUnclaimedCreatorsWinningsInstructionData' }
    ),
    (value) => ({
      ...value,
      discriminator: new Uint8Array([223, 124, 225, 226, 237, 254, 93, 105]),
    })
  ) as Serializer<
    WithdrawUnclaimedCreatorsWinningsInstructionDataArgs,
    WithdrawUnclaimedCreatorsWinningsInstructionData
  >;
}

// Instruction.
export function withdrawUnclaimedCreatorsWinnings(
  context: Pick<Context, 'eddsa' | 'programs'>,
  input: WithdrawUnclaimedCreatorsWinningsInstructionAccounts
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
    vault: {
      index: 2,
      isWritable: true as boolean,
      value: input.vault ?? null,
    },
    systemProgram: {
      index: 3,
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
    getWithdrawUnclaimedCreatorsWinningsInstructionDataSerializer().serialize(
      {}
    );

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return transactionBuilder([
    { instruction: { keys, programId, data }, signers, bytesCreatedOnChain },
  ]);
}
