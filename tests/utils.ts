import { web3 } from "@coral-xyz/anchor";

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
