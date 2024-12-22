import { web3, BN, Provider } from "@coral-xyz/anchor";
import { ConfigType, UserBetEnumType } from "./onChain.types";

import {
  PublicKey,
  keypairIdentity,
  Umi,
  createSignerFromKeypair,
  generateSigner,
  percentAmount,
  publicKey,
  assertAccountExists,
  some,
} from "@metaplex-foundation/umi";
import {
  createAssociatedToken,
  mplToolbox,
} from "@metaplex-foundation/mpl-toolbox";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { Connection, Keypair } from "@solana/web3.js";
import {
  createMint,
  getAssociatedTokenAddressSync,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";
import {
  mintV1,
  TokenStandard,
  createFungible,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  fromWeb3JsPublicKey,
  toWeb3JsPublicKey,
  toWeb3JsKeypair,
} from "@metaplex-foundation/umi-web3js-adapters";

export const confirmOpts: web3.ConfirmOptions = {
  preflightCommitment: "confirmed",
  commitment: "confirmed",
};

export const calculateFee = (amount: BN, fee_bp: number) => {
  return amount.mul(new BN(fee_bp)).div(new BN(10_000));
};

function isValidBettingSide(value: unknown): value is UserBetEnumType {
  // Check if value is an object
  if (typeof value !== "object" || value === null) {
    return false;
  }

  // Check if the object has either santa or grinch property but not both
  const obj = value as Record<string, unknown>;
  const hasSanta = "santa" in obj;
  const hasGrinch = "grinch" in obj;

  if (!hasSanta && !hasGrinch) return false;
  if (hasSanta && hasGrinch) return false;

  // Check if the value of santa/grinch is an empty object
  if (hasSanta) {
    const santa = obj.santa as Record<string, never>;
    return Object.keys(santa).length === 0;
  }

  if (hasGrinch) {
    const grinch = obj.grinch as Record<string, never>;
    return Object.keys(grinch).length === 0;
  }

  return false;
}

function areUserBetsEqual(
  bet1: UserBetEnumType,
  bet2: UserBetEnumType
): boolean {
  if ("santa" in bet1) {
    return "santa" in bet2;
  }

  if ("grinch" in bet1) {
    return "grinch" in bet2;
  }

  return false;
}

export function calculateWinnings(
  betAmount: number,
  betSide: UserBetEnumType,
  config: ConfigType
) {
  if (!isValidBettingSide(config.winningSide)) {
    // It's a tie. Return a 87.5% of original pot (12.5 penalty)
    return (betAmount * 875) / 1000;
  }

  if (!areUserBetsEqual(betSide, config.winningSide)) {
    return 0;
  }

  const { losingPot, winningPot } = config.winningSide.santa
    ? { losingPot: config.grinchPot, winningPot: config.santaPot }
    : { losingPot: config.santaPot, winningPot: config.grinchPot };

  const losingPotShare = (losingPot.toNumber() * 75) / 100;
  const winnerShare = (losingPotShare * betAmount) / winningPot.toNumber();

  return betAmount + winnerShare;
}

export async function createSplMint(umi: Umi, options) {
  try {
    const mint = generateSigner(umi);

    const txResult = await createFungible(umi, {
      mint,
      name: "Santa-vs-Grinch Token",
      uri: "https://arweave.net/123",
      sellerFeeBasisPoints: percentAmount(5.5),
      decimals: some(6),
    }).sendAndConfirm(umi, options);

    return mint.publicKey;
  } catch (error) {
    console.error("Error creating mint:", error);
    throw error;
  }
}

export async function mintSplMint(
  umi: Umi,
  mint: PublicKey,
  owner: web3.PublicKey,
  amount: bigint,
  options
) {
  try {
    const ata = getAssociatedTokenAddressSync(toWeb3JsPublicKey(mint), owner);

    await mintV1(umi, {
      mint: mint,
      authority: umi.payer,
      amount,
      tokenOwner: fromWeb3JsPublicKey(owner),
      tokenStandard: TokenStandard.Fungible,
    }).sendAndConfirm(umi, options);

    return ata;
  } catch (error) {
    console.error("Error minting mint:", error);
    throw error;
  }
}

export function initializeUmi(provider: Provider) {
  const umi = createUmi(provider.connection.rpcEndpoint, {
    commitment: "confirmed",
  });

  // Anchor Wallet interface is a wrapper over NodeWallet which has payer keypair that we need not exposed to Provider
  const admin = umi.eddsa.createKeypairFromSecretKey(
    // @ts-ignore
    (provider.wallet.payer as Keypair).secretKey
  );

  umi.use(keypairIdentity(admin));
  umi.use(mplToolbox());

  return umi;
}

export function generateRandomU64Seed(): BigInt {
  const randomBytes = web3.Keypair.generate().secretKey.slice(0, 8);

  return BigInt(new BN(randomBytes).toString());
}
