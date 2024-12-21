import { web3, BN, Provider } from "@coral-xyz/anchor";
import { ConfigType, UserBetEnumType } from "./onChain.types";

import {
  keypairIdentity,
  Umi,
  createSignerFromKeypair,
  generateSigner,
  publicKey,
  assertAccountExists,
} from "@metaplex-foundation/umi";
import { mplToolbox } from "@metaplex-foundation/mpl-toolbox";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { Connection, Keypair } from "@solana/web3.js";
import { createMint } from "@solana/spl-token";
import { toWeb3JsKeypair } from "@metaplex-foundation/umi-web3js-adapters";

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

export async function createSplMint(umi: Umi) {
  try {
    const connection = new Connection(umi.rpc.getEndpoint());
    const keypair = Keypair.generate();

    const payer = toWeb3JsKeypair(umi.payer);

    const mint = await createMint(
      connection,
      payer,
      keypair.publicKey,
      null,
      6
    );

    return mint;
  } catch (error) {
    console.error("Error creating mint:", error);
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
