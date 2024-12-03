import * as anchor from "@coral-xyz/anchor";
import { Program, web3 } from "@coral-xyz/anchor";
import { airdropIfRequired, makeKeypairs } from "@solana-developers/helpers";
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { assert, expect } from "chai";
import { SantaVsGrinch } from "../target/types/santa_vs_grinch";

describe("santa-vs-grinch", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.SantaVsGrinch as Program<SantaVsGrinch>;
  const provider = anchor.getProvider();

  let accounts: Record<string, PublicKey | Keypair> = {};
  let bumps: Record<string, unknown> = {};

  before(async () => {
    const [user1, user2] = makeKeypairs(2);

    await Promise.all(
      [user1, user2].map(async (u) => {
        return await airdropIfRequired(
          provider.connection,
          u.publicKey,
          10 * LAMPORTS_PER_SOL,
          1 * LAMPORTS_PER_SOL
        );
      })
    );

    const [configState, configStateBump] =
      web3.PublicKey.findProgramAddressSync(
        [Buffer.from("state"), provider.publicKey.toBuffer()],
        program.programId
      );

    const [santaVault, santaVaultBump] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), configState.toBuffer(), Buffer.from("santa")],
      program.programId
    );

    const [grinchVault, grinchVaultBump] =
      web3.PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), configState.toBuffer(), Buffer.from("grinch")],
        program.programId
      );

    // Save accounts
    accounts.configState = configState;
    accounts.santaVault = santaVault;
    accounts.grinchVault = grinchVault;

    accounts.user1 = user1;
    accounts.user2 = user2;

    // Save bumps
    bumps.configStateBump = configStateBump;
    bumps.santaVaultBump = santaVaultBump;
    bumps.grinchVaultBump = grinchVaultBump;
  });

  it("Is initialized!", async () => {
    // Add your test here.

    const tx = await program.methods
      .initialize()
      .accounts({
        admin: provider.publicKey,
        state: accounts.configState,
        santaVault: accounts.santaVault,
        grinchVault: accounts.grinchVault,
      })
      .rpc();

    console.log("Tx sig:", tx);

    const config = await program.account.config.fetch(accounts.configState);

    assert.equal(config.admin.toBase58(), provider.publicKey.toBase58());
    assert.equal(
      config.santaVault,
      (accounts.santaVault as PublicKey).toBase58()
    );
    assert.equal(
      config.grinchVault,
      (accounts.grinchVault as PublicKey).toBase58()
    );
    assert.equal(config.bump, bumps.configStateBump);
    assert.equal(config.santaVaultBump, bumps.santaVaultBump);
    assert.equal(config.grinchVaultBump, bumps.grinchVaultBump);

    // Save grinchVault and santaVault;
  });

  it("Deposit into Santa Vault", async () => {
    const [user1UserStatePubkey, _bump] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("user"), (accounts.user1 as Keypair).publicKey.toBuffer()],
      program.programId
    );

    const amount = new anchor.BN(0.05 * LAMPORTS_PER_SOL);
    const tx = await program.methods
      .deposit(amount)
      .accounts({
        user: (accounts.user1 as Keypair).publicKey,
        state: accounts.configState,
        vault: accounts.santaVault,
        userState: user1UserStatePubkey,
      })
      .signers(accounts.user1)
      .rpc();

    const user1UserStateAccount = await program.account.user.fetch(
      user1UserStatePubkey
    );

    assert.equal(
      user1UserStateAccount.santaPoints.toNumber(),
      amount.toNumber()
    );
    assert.equal(
      user1UserStateAccount.grinchPoints.toNumber(),
      new anchor.BN(0).toNumber()
    );
  });

  it("Deposit into Grinch Vault", async () => {
    const [user1UserStatePubkey, _bump] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("user"), (accounts.user1 as Keypair).publicKey.toBuffer()],
      program.programId
    );

    let user1UserStateAccount = await program.account.user.fetch(
      user1UserStatePubkey
    );

    const oldSantaPoints = user1UserStateAccount.santaPoints;

    const amount = new anchor.BN(0.1 * LAMPORTS_PER_SOL);
    const tx = await program.methods
      .deposit(amount)
      .accounts({
        user: (accounts.user1 as Keypair).publicKey,
        state: accounts.configState,
        vault: accounts.grinchVault,
        userState: user1UserStatePubkey,
      })
      .signers(accounts.user1)
      .rpc();

    user1UserStateAccount = await program.account.user.fetch(
      user1UserStatePubkey
    );

    assert.equal(
      user1UserStateAccount.santaPoints.toNumber(),
      oldSantaPoints.toNumber()
    );
    assert.equal(
      user1UserStateAccount.grinchPoints.toNumber(),
      amount.toNumber()
    );
  });

  it("Deposit into Invalid Vault - Should Fail!", async () => {
    const [user1UserStatePubkey, _bump] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("user"), (accounts.user1 as Keypair).publicKey.toBuffer()],
      program.programId
    );

    const amount = new anchor.BN(0.1 * LAMPORTS_PER_SOL);
    try {
      const tx = await program.methods
        .deposit(amount)
        .accounts({
          user: (accounts.user1 as Keypair).publicKey,
          state: accounts.configState,
          vault: PublicKey.unique(),
          userState: user1UserStatePubkey,
        })
        .signers(accounts.user1)
        .rpc();

      expect.fail("Transaction should have failed");
    } catch (err) {
      if (err instanceof anchor.AnchorError) {
        expect(err.error.errorCode.code).to.equal("InvalidVaultDepositAccount");
        expect(err.error.errorCode.number).to.equal(6000); // Your error number
        // Optionally check the error message
        expect(err.error.errorMessage).to.equal(
          "Invalid deposit vault account"
        );
      } else {
        throw err;
      }
    }
  });
});
