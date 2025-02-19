/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/kinobi-so/kinobi
 */

import {
  combineCodec,
  getAddressDecoder,
  getAddressEncoder,
  getArrayDecoder,
  getArrayEncoder,
  getStructDecoder,
  getStructEncoder,
  getU16Decoder,
  getU16Encoder,
  getU64Decoder,
  getU64Encoder,
  getU8Decoder,
  getU8Encoder,
  type Address,
  type Codec,
  type Decoder,
  type Encoder,
} from '@solana/web3.js';
import {
  getCreatorDecoder,
  getCreatorEncoder,
  type Creator,
  type CreatorArgs,
} from '.';

export type InitializeArgs = {
  maxNumCreators: number;
  adminFeePercentageBp: number;
  betBurnPercentageBp: number;
  mysteryBoxBurnPercentageBp: number;
  mysteryBoxPrice: bigint;
  buybackWallet: Address;
  buybackPercentageBp: number;
  creators: Array<Creator>;
};

export type InitializeArgsArgs = {
  maxNumCreators: number;
  adminFeePercentageBp: number;
  betBurnPercentageBp: number;
  mysteryBoxBurnPercentageBp: number;
  mysteryBoxPrice: number | bigint;
  buybackWallet: Address;
  buybackPercentageBp: number;
  creators: Array<CreatorArgs>;
};

export function getInitializeArgsEncoder(): Encoder<InitializeArgsArgs> {
  return getStructEncoder([
    ['maxNumCreators', getU8Encoder()],
    ['adminFeePercentageBp', getU16Encoder()],
    ['betBurnPercentageBp', getU16Encoder()],
    ['mysteryBoxBurnPercentageBp', getU16Encoder()],
    ['mysteryBoxPrice', getU64Encoder()],
    ['buybackWallet', getAddressEncoder()],
    ['buybackPercentageBp', getU16Encoder()],
    ['creators', getArrayEncoder(getCreatorEncoder(), { size: 3 })],
  ]);
}

export function getInitializeArgsDecoder(): Decoder<InitializeArgs> {
  return getStructDecoder([
    ['maxNumCreators', getU8Decoder()],
    ['adminFeePercentageBp', getU16Decoder()],
    ['betBurnPercentageBp', getU16Decoder()],
    ['mysteryBoxBurnPercentageBp', getU16Decoder()],
    ['mysteryBoxPrice', getU64Decoder()],
    ['buybackWallet', getAddressDecoder()],
    ['buybackPercentageBp', getU16Decoder()],
    ['creators', getArrayDecoder(getCreatorDecoder(), { size: 3 })],
  ]);
}

export function getInitializeArgsCodec(): Codec<
  InitializeArgsArgs,
  InitializeArgs
> {
  return combineCodec(getInitializeArgsEncoder(), getInitializeArgsDecoder());
}
