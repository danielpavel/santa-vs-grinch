import { web3, BN } from "@coral-xyz/anchor";

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

export function prettyPrintConfigState(config: any) {}
