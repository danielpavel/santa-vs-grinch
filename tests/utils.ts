import { web3, BN } from "@coral-xyz/anchor";
import { ConfigType, UserBetEnumType } from "./onChain.types";

export const confirmOpts: web3.ConfirmOptions = {
  preflightCommitment: "confirmed",
  commitment: "confirmed",
};

// Helpers
export const confirmTx = async (signature: string) => {
  const latestBlockhash = await anchor
    .getProvider()
    .connection.getLatestBlockhash();
  await anchor.getProvider().connection.confirmTransaction(
    {
      signature,
      ...latestBlockhash,
    },
    confirmOpts.commitment
  );
};

export const confirmTxs = async (signatures: string[]) => {
  await Promise.all(signatures.map(confirmTx));
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
