import * as anchor from "@coral-xyz/anchor";
import { Program, web3 } from "@coral-xyz/anchor";
import { airdropIfRequired, makeKeypairs } from "@solana-developers/helpers";
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { assert, expect } from "chai";
import { SantaVsGrinch } from "../target/types/santa_vs_grinch";
import { calculateFee, confirmTx } from "./utils";

describe("santa-vs-grinch", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.SantaVsGrinch as Program<SantaVsGrinch>;
  const provider = anchor.getProvider();

  let accounts: Record<string, unknown> = {};
  let bumps: Record<string, number> = {};

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

    const [feesVault, feesVaultBump] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), configState.toBuffer(), Buffer.from("fees")],
      program.programId
    );

    // Save accounts
    accounts.configState = configState;
    accounts.santaVault = santaVault;
    accounts.grinchVault = grinchVault;
    accounts.feesVault = feesVault;

    accounts.user1 = user1;
    accounts.user2 = user2;

    // Save bumps
    bumps.configStateBump = configStateBump;
    bumps.santaVaultBump = santaVaultBump;
    bumps.grinchVaultBump = grinchVaultBump;
    bumps.feesVaultBump = feesVaultBump;

    // NOTE: depositing too little of a fee in feeVault results in:
    // `Transaction results in an account (2) with insufficient funds for rent.`
    // so we're topping up
    await airdropIfRequired(
      provider.connection,
      accounts.feesVault,
      1 * LAMPORTS_PER_SOL,
      0.1 * LAMPORTS_PER_SOL
    );
  });

  it("Is initialized!", async () => {
    // Add your test here.

    const fee_bp = 100;
    const tx = await program.methods
      .initialize(fee_bp)
      .accounts({
        admin: provider.publicKey,
        state: accounts.configState,
        santaVault: accounts.santaVault,
        grinchVault: accounts.grinchVault,
        feesVault: accounts.feesVault,
      })
      .rpc();

    console.log("Tx sig:", tx);

    const config = await program.account.config.fetch(
      accounts.configState as PublicKey
    );

    assert.equal(config.admin.toBase58(), provider.publicKey.toBase58());
    assert.equal(
      config.santaVault,
      (accounts.santaVault as PublicKey).toBase58()
    );
    assert.equal(
      config.grinchVault,
      (accounts.grinchVault as PublicKey).toBase58()
    );
    assert.equal(
      config.feesVault,
      (accounts.feesVault as PublicKey).toBase58()
    );
    assert.equal(config.adminFeePercentageBp, fee_bp);
    assert.equal(config.santaPot.toNumber(), 0);
    assert.equal(config.santaBoxes.toNumber(), 0);
    assert.equal(config.grinchPot.toNumber(), 0);
    assert.equal(config.grinchBoxes.toNumber(), 0);
    assert.equal(config.bump, bumps.configStateBump);
    assert.equal(config.santaVaultBump, bumps.santaVaultBump);
    assert.equal(config.grinchVaultBump, bumps.grinchVaultBump);
  });

  it("Deposit into Santa Vault", async () => {
    const [user1UserStatePubkey, _bump] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("user"), (accounts.user1 as Keypair).publicKey.toBuffer()],
      program.programId
    );

    let config = await program.account.config.fetch(
      accounts.configState as PublicKey
    );

    const adminFeePercentageBp = config.adminFeePercentageBp;
    const amount = new anchor.BN(0.1 * LAMPORTS_PER_SOL);
    const fee = calculateFee(amount, adminFeePercentageBp);
    const depositAmount = amount.sub(fee);

    const tx = await program.methods
      .deposit(amount)
      .accounts({
        user: (accounts.user1 as Keypair).publicKey,
        state: accounts.configState,
        vault: accounts.santaVault,
        feesVault: accounts.feesVault,
        userBet: user1UserStatePubkey,
      })
      .signers(accounts.user1)
      .rpc();

    const feeVaultBalance = await provider.connection.getBalance(
      accounts.feesVault
    );
    assert.equal(feeVaultBalance, LAMPORTS_PER_SOL + fee.toNumber());

    config = await program.account.config.fetch(
      accounts.configState as PublicKey
    );

    assert.equal(config.santaPot.toNumber(), depositAmount.toNumber());

    const user1UserStateAccount = await program.account.userBet.fetch(
      user1UserStatePubkey
    );

    assert.equal(
      user1UserStateAccount.amount.toNumber(),
      depositAmount.toNumber()
    );
    assert.deepEqual(user1UserStateAccount.side, { santa: {} });
    assert.deepEqual(
      user1UserStateAccount.owner,
      (accounts.user1 as Keypair).publicKey
    );
  });

  it("Deposit into Grinch Vault", async () => {
    const [user2UserStatePubkey, _bump] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("user"), (accounts.user2 as Keypair).publicKey.toBuffer()],
      program.programId
    );

    const feeVaultBalanceOld = await provider.connection.getBalance(
      accounts.feesVault
    );

    let config = await program.account.config.fetch(
      accounts.configState as PublicKey
    );

    const adminFeePercentageBp = config.adminFeePercentageBp;
    const amount = new anchor.BN(0.1 * LAMPORTS_PER_SOL);
    const fee = calculateFee(amount, adminFeePercentageBp);
    const depositAmount = amount.sub(fee);

    const tx = await program.methods
      .deposit(amount)
      .accounts({
        user: (accounts.user2 as Keypair).publicKey,
        state: accounts.configState,
        vault: accounts.grinchVault,
        feesVault: accounts.feesVault,
        userBet: user2UserStatePubkey,
      })
      .signers(accounts.user2)
      .rpc();

    const feeVaultBalance = await provider.connection.getBalance(
      accounts.feesVault
    );
    assert.equal(feeVaultBalance, feeVaultBalanceOld + fee.toNumber());

    config = await program.account.config.fetch(
      accounts.configState as PublicKey
    );
    assert.equal(config.grinchPot.toNumber(), depositAmount.toNumber());

    const user2UserStateAccount = await program.account.userBet.fetch(
      user2UserStatePubkey
    );

    assert.equal(
      user2UserStateAccount.amount.toNumber(),
      depositAmount.toNumber()
    );
    assert.deepEqual(user2UserStateAccount.side, { grinch: {} });
    assert.deepEqual(
      user2UserStateAccount.owner,
      (accounts.user2 as Keypair).publicKey
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
          feesVault: accounts.feesVault,
          userBet: user1UserStatePubkey,
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

  it("Buy Mystery Box Santa", async () => {
    const side = { santa: {} }; // On-chain BettingSide Enum Representation
    const BOX_PRICE = 500_000_000;

    let feeVaultBalanceOld = await provider.connection.getBalance(
      accounts.feesVault
    );

    const tx = await program.methods
      .buyMysteryBox(side)
      .accounts({
        user: (accounts.user1 as Keypair).publicKey,
        state: accounts.configState,
        feesVault: accounts.feesVault,
      })
      .signers([accounts.user1])
      .rpc();

    const configStateAccount = await program.account.config.fetch(
      accounts.configState
    );

    assert.equal(configStateAccount.santaBoxes.toNumber(), 1);

    const feeVaultBalance = await provider.connection.getBalance(
      accounts.feesVault
    );
    assert.equal(feeVaultBalance, feeVaultBalanceOld + BOX_PRICE);
  });

  it("Buy Mystery Box Grinch", async () => {
    const side = { grinch: {} }; // On-chain BettingSide Enum Representation
    const BOX_PRICE = 500_000_000;

    let feeVaultBalanceOld = await provider.connection.getBalance(
      accounts.feesVault
    );

    const tx = await program.methods
      .buyMysteryBox(side)
      .accounts({
        user: (accounts.user2 as Keypair).publicKey,
        state: accounts.configState,
        feesVault: accounts.feesVault,
      })
      .signers([accounts.user2])
      .rpc();

    const configStateAccount = await program.account.config.fetch(
      accounts.configState
    );

    assert.equal(configStateAccount.grinchBoxes.toNumber(), 1);

    const feeVaultBalance = await provider.connection.getBalance(
      accounts.feesVault
    );
    assert.equal(feeVaultBalance, feeVaultBalanceOld + BOX_PRICE);
  });
});
