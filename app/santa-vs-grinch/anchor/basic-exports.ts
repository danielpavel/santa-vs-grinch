// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import SantaVsGrinchIDL from "./santa_vs_grinch.json";
import type { SantaVsGrinch } from "./santa_vs_grinch";

// Re-export the generated IDL and type
export { SantaVsGrinch, SantaVsGrinchIDL };

// The programId is imported from the program IDL.
export const SANTA_VS_GRINCH_PROGRAM_ID = new PublicKey(
  SantaVsGrinchIDL.address
);

// This is a helper function to get the SantaVsGrinch Anchor program.
export function getSantaVsGrinchProgram(provider: AnchorProvider) {
  return new Program(SantaVsGrinchIDL as SantaVsGrinch, provider);
}

