/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/kinobi-so/kinobi
 */

import {
  Serializer,
  array,
  struct,
  u16,
  u64,
  u8,
} from '@metaplex-foundation/umi/serializers';
import { Creator, CreatorArgs, getCreatorSerializer } from '.';

export type InitializeArgs = {
  maxNumCreators: number;
  adminFeePercentageBp: number;
  betBurnPercentageBp: number;
  mysteryBoxBurnPercentageBp: number;
  mysteryBoxPrice: bigint;
  creators: Array<Creator>;
};

export type InitializeArgsArgs = {
  maxNumCreators: number;
  adminFeePercentageBp: number;
  betBurnPercentageBp: number;
  mysteryBoxBurnPercentageBp: number;
  mysteryBoxPrice: number | bigint;
  creators: Array<CreatorArgs>;
};

export function getInitializeArgsSerializer(): Serializer<
  InitializeArgsArgs,
  InitializeArgs
> {
  return struct<InitializeArgs>(
    [
      ['maxNumCreators', u8()],
      ['adminFeePercentageBp', u16()],
      ['betBurnPercentageBp', u16()],
      ['mysteryBoxBurnPercentageBp', u16()],
      ['mysteryBoxPrice', u64()],
      ['creators', array(getCreatorSerializer(), { size: 3 })],
    ],
    { description: 'InitializeArgs' }
  ) as Serializer<InitializeArgsArgs, InitializeArgs>;
}
