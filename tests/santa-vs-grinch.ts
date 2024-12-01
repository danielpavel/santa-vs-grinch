import * as anchor from "@coral-xyz/anchor";
import { Program, web3 } from "@coral-xyz/anchor";
import { makeKeypairs } from "@solana-developers/helpers";
import { PublicKey } from "@solana/web3.js";
import { assert } from "chai";
import { SantaVsGrinch } from "../target/types/santa_vs_grinch";

describe("santa-vs-grinch", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.SantaVsGrinch as Program<SantaVsGrinch>;
  const provider = anchor.getProvider();
  const connection = provider.connection;

  let accounts: Record<string, unknown> = {};
  let bumps: Record<string, unknown> = {};

  before(() => {
    const [configState, configStateBump] =
      web3.PublicKey.findProgramAddressSync(
        [Buffer.from("state"), provider.publicKey.toBuffer()],
        program.programId
      );

    const [vault, vaultBump] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), configState.toBuffer()],
      program.programId
    );

    // Save accounts
    accounts.configState = configState;
    accounts.vault = vault;

    // Save bumps
    bumps.configStateBump = configStateBump;
    bumps.vaultBump = vaultBump;
  });

  it("Is initialized!", async () => {
    // Add your test here.

    const tx = await program.methods
      .initialize()
      .accounts({
        admin: provider.publicKey,
        state: accounts.configState,
        vault: accounts.vault,
      })
      .rpc();

    console.log("Tx sig:", tx);

    const config = await program.account.config.fetch(accounts.configState);

    assert.equal(config.admin.toBase58(), provider.publicKey.toBase58());
    assert.equal(config.vault, (accounts.vault as PublicKey).toBase58());
    assert.equal(config.bump, bumps.configStateBump);
  });
});
