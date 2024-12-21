/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/kinobi-so/kinobi
 */

import {
  Account,
  Context,
  Option,
  OptionOrNullable,
  Pda,
  PublicKey,
  RpcAccount,
  RpcGetAccountOptions,
  RpcGetAccountsOptions,
  assertAccountExists,
  deserializeAccount,
  gpaBuilder,
  publicKey as toPublicKey,
} from '@metaplex-foundation/umi';
import {
  Serializer,
  array,
  bool,
  bytes,
  i64,
  mapSerializer,
  option,
  publicKey as publicKeySerializer,
  struct,
  u16,
  u32,
  u64,
  u8,
} from '@metaplex-foundation/umi/serializers';
import {
  BettingSide,
  BettingSideArgs,
  Creator,
  CreatorArgs,
  getBettingSideSerializer,
  getCreatorSerializer,
} from '../types';

export type Config = Account<ConfigAccountData>;

export type ConfigAccountData = {
  discriminator: Uint8Array;
  admin: PublicKey;
  mint: PublicKey;
  adminFeePercentageBp: number;
  betBurnPercentageBp: number;
  mysteryBoxBurnPercentageBp: number;
  mysteryBoxPrice: bigint;
  vault: PublicKey;
  feesVault: PublicKey;
  totalBurned: bigint;
  santaPot: bigint;
  grinchPot: bigint;
  santaBoxes: bigint;
  grinchBoxes: bigint;
  santaMultiplier: number;
  grinchMultiplier: number;
  gameEnded: boolean;
  isActiveAt: bigint;
  withdrawUnclaimedAt: bigint;
  winningSide: Option<BettingSide>;
  creators: Array<Creator>;
  vaultBump: number;
  feesVaultBump: number;
  bump: number;
  seed: bigint;
};

export type ConfigAccountDataArgs = {
  admin: PublicKey;
  mint: PublicKey;
  adminFeePercentageBp: number;
  betBurnPercentageBp: number;
  mysteryBoxBurnPercentageBp: number;
  mysteryBoxPrice: number | bigint;
  vault: PublicKey;
  feesVault: PublicKey;
  totalBurned: number | bigint;
  santaPot: number | bigint;
  grinchPot: number | bigint;
  santaBoxes: number | bigint;
  grinchBoxes: number | bigint;
  santaMultiplier: number;
  grinchMultiplier: number;
  gameEnded: boolean;
  isActiveAt: number | bigint;
  withdrawUnclaimedAt: number | bigint;
  winningSide: OptionOrNullable<BettingSideArgs>;
  creators: Array<CreatorArgs>;
  vaultBump: number;
  feesVaultBump: number;
  bump: number;
  seed: number | bigint;
};

export function getConfigAccountDataSerializer(): Serializer<
  ConfigAccountDataArgs,
  ConfigAccountData
> {
  return mapSerializer<ConfigAccountDataArgs, any, ConfigAccountData>(
    struct<ConfigAccountData>(
      [
        ['discriminator', bytes({ size: 8 })],
        ['admin', publicKeySerializer()],
        ['mint', publicKeySerializer()],
        ['adminFeePercentageBp', u16()],
        ['betBurnPercentageBp', u16()],
        ['mysteryBoxBurnPercentageBp', u16()],
        ['mysteryBoxPrice', u64()],
        ['vault', publicKeySerializer()],
        ['feesVault', publicKeySerializer()],
        ['totalBurned', u64()],
        ['santaPot', u64()],
        ['grinchPot', u64()],
        ['santaBoxes', u64()],
        ['grinchBoxes', u64()],
        ['santaMultiplier', u32()],
        ['grinchMultiplier', u32()],
        ['gameEnded', bool()],
        ['isActiveAt', i64()],
        ['withdrawUnclaimedAt', i64()],
        ['winningSide', option(getBettingSideSerializer())],
        ['creators', array(getCreatorSerializer(), { size: 3 })],
        ['vaultBump', u8()],
        ['feesVaultBump', u8()],
        ['bump', u8()],
        ['seed', u64()],
      ],
      { description: 'ConfigAccountData' }
    ),
    (value) => ({
      ...value,
      discriminator: new Uint8Array([155, 12, 170, 224, 30, 250, 204, 130]),
    })
  ) as Serializer<ConfigAccountDataArgs, ConfigAccountData>;
}

export function deserializeConfig(rawAccount: RpcAccount): Config {
  return deserializeAccount(rawAccount, getConfigAccountDataSerializer());
}

export async function fetchConfig(
  context: Pick<Context, 'rpc'>,
  publicKey: PublicKey | Pda,
  options?: RpcGetAccountOptions
): Promise<Config> {
  const maybeAccount = await context.rpc.getAccount(
    toPublicKey(publicKey, false),
    options
  );
  assertAccountExists(maybeAccount, 'Config');
  return deserializeConfig(maybeAccount);
}

export async function safeFetchConfig(
  context: Pick<Context, 'rpc'>,
  publicKey: PublicKey | Pda,
  options?: RpcGetAccountOptions
): Promise<Config | null> {
  const maybeAccount = await context.rpc.getAccount(
    toPublicKey(publicKey, false),
    options
  );
  return maybeAccount.exists ? deserializeConfig(maybeAccount) : null;
}

export async function fetchAllConfig(
  context: Pick<Context, 'rpc'>,
  publicKeys: Array<PublicKey | Pda>,
  options?: RpcGetAccountsOptions
): Promise<Config[]> {
  const maybeAccounts = await context.rpc.getAccounts(
    publicKeys.map((key) => toPublicKey(key, false)),
    options
  );
  return maybeAccounts.map((maybeAccount) => {
    assertAccountExists(maybeAccount, 'Config');
    return deserializeConfig(maybeAccount);
  });
}

export async function safeFetchAllConfig(
  context: Pick<Context, 'rpc'>,
  publicKeys: Array<PublicKey | Pda>,
  options?: RpcGetAccountsOptions
): Promise<Config[]> {
  const maybeAccounts = await context.rpc.getAccounts(
    publicKeys.map((key) => toPublicKey(key, false)),
    options
  );
  return maybeAccounts
    .filter((maybeAccount) => maybeAccount.exists)
    .map((maybeAccount) => deserializeConfig(maybeAccount as RpcAccount));
}

export function getConfigGpaBuilder(
  context: Pick<Context, 'rpc' | 'programs'>
) {
  const programId = context.programs.getPublicKey(
    'santaVsGrinch',
    '5Kox1zWxgz9oGXCYw65iGKAHYmiFov6FpPCib71NZ75x'
  );
  return gpaBuilder(context, programId)
    .registerFields<{
      discriminator: Uint8Array;
      admin: PublicKey;
      mint: PublicKey;
      adminFeePercentageBp: number;
      betBurnPercentageBp: number;
      mysteryBoxBurnPercentageBp: number;
      mysteryBoxPrice: number | bigint;
      vault: PublicKey;
      feesVault: PublicKey;
      totalBurned: number | bigint;
      santaPot: number | bigint;
      grinchPot: number | bigint;
      santaBoxes: number | bigint;
      grinchBoxes: number | bigint;
      santaMultiplier: number;
      grinchMultiplier: number;
      gameEnded: boolean;
      isActiveAt: number | bigint;
      withdrawUnclaimedAt: number | bigint;
      winningSide: OptionOrNullable<BettingSideArgs>;
      creators: Array<CreatorArgs>;
      vaultBump: number;
      feesVaultBump: number;
      bump: number;
      seed: number | bigint;
    }>({
      discriminator: [0, bytes({ size: 8 })],
      admin: [8, publicKeySerializer()],
      mint: [40, publicKeySerializer()],
      adminFeePercentageBp: [72, u16()],
      betBurnPercentageBp: [74, u16()],
      mysteryBoxBurnPercentageBp: [76, u16()],
      mysteryBoxPrice: [78, u64()],
      vault: [86, publicKeySerializer()],
      feesVault: [118, publicKeySerializer()],
      totalBurned: [150, u64()],
      santaPot: [158, u64()],
      grinchPot: [166, u64()],
      santaBoxes: [174, u64()],
      grinchBoxes: [182, u64()],
      santaMultiplier: [190, u32()],
      grinchMultiplier: [194, u32()],
      gameEnded: [198, bool()],
      isActiveAt: [199, i64()],
      withdrawUnclaimedAt: [207, i64()],
      winningSide: [215, option(getBettingSideSerializer())],
      creators: [null, array(getCreatorSerializer(), { size: 3 })],
      vaultBump: [null, u8()],
      feesVaultBump: [null, u8()],
      bump: [null, u8()],
      seed: [null, u64()],
    })
    .deserializeUsing<Config>((account) => deserializeConfig(account))
    .whereField(
      'discriminator',
      new Uint8Array([155, 12, 170, 224, 30, 250, 204, 130])
    );
}
