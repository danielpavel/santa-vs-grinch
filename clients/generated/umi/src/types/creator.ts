/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/kinobi-so/kinobi
 */

import { PublicKey } from '@metaplex-foundation/umi';
import {
  Serializer,
  publicKey as publicKeySerializer,
  struct,
  u16,
} from '@metaplex-foundation/umi/serializers';

export type Creator = { pubkey: PublicKey; shareInBp: number };

export type CreatorArgs = Creator;

export function getCreatorSerializer(): Serializer<CreatorArgs, Creator> {
  return struct<Creator>(
    [
      ['pubkey', publicKeySerializer()],
      ['shareInBp', u16()],
    ],
    { description: 'Creator' }
  ) as Serializer<CreatorArgs, Creator>;
}