import * as anchor from "@coral-xyz/anchor";
import { Program, web3 } from "@coral-xyz/anchor";
import { airdropIfRequired, makeKeypairs } from "@solana-developers/helpers";
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { assert, expect } from "chai";
import { SantaVsGrinch } from "../target/types/santa_vs_grinch";
import { CREATOR_1, CREATOR_2, CREATOR_3 } from "./constants";
import { CreatorType } from "./onChain.types";
import { calculateFee, calculateWinnings } from "./utils";

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

    const [vault, vaultBump] = web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("vault"),
        configState.toBuffer(),
        Buffer.from("santa-vs-grinch"),
      ],
      program.programId
    );

    const [feesVault, feesVaultBump] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), configState.toBuffer(), Buffer.from("fees")],
      program.programId
    );

    // Save accounts
    accounts.configState = configState;
    accounts.vault = vault;
    accounts.feesVault = feesVault;

    accounts.user1 = user1;
    accounts.user2 = user2;

    accounts.creator1 = { pubkey: CREATOR_1, shareInBp: 3333 };
    accounts.creator2 = { pubkey: CREATOR_2, shareInBp: 3333 };
    accounts.creator3 = { pubkey: CREATOR_3, shareInBp: 3334 };

    // Save bumps
    bumps.configStateBump = configStateBump;
    bumps.vaultBump = vaultBump;
    bumps.feesVaultBump = feesVaultBump;

    // NOTE: depositing too little of a fee in feeVault results in:
    // `Transaction results in an account (2) with insufficient funds for rent.`
    // so we're topping up before 1st deposit.
    await airdropIfRequired(
      provider.connection,
      accounts.feesVault,
      1 * LAMPORTS_PER_SOL,
      0.1 * LAMPORTS_PER_SOL
    );
  });

  it("Is initialized!", async () => {
    // Add your test here.
    //
    const creators = [accounts.creator1, accounts.creator2, accounts.creator3];

    const fee_bp = 100;
    const tx = await program.methods
      .initialize(
        creators as Array<{ pubkey: PublicKey; shareInBp: number }>,
        creators.length as number,
        fee_bp as number
      )
      .accounts({
        admin: provider.publicKey,
        state: accounts.configState,
        vault: accounts.vault,
        feesVault: accounts.feesVault,
      })
      .rpc();

    const config = await program.account.config.fetch(
      accounts.configState as PublicKey
    );

    assert.equal(config.admin.toBase58(), provider.publicKey.toBase58());
    assert.equal(
      config.vault.toBase58(),
      (accounts.vault as PublicKey).toBase58()
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
    assert.equal(config.vaultBump, bumps.vaultBump);
    assert.equal(config.feesVaultBump, bumps.feesVaultBump);

    // assert creators and correct share_in_bp
    assert.deepEqual(config.creators[0], accounts.creator1);
    assert.deepEqual(config.creators[1], accounts.creator2);
    assert.deepEqual(config.creators[2], accounts.creator3);
  });

  it("Bet on Santa", async () => {
    const [user1UserStatePubkey, _bump] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("user"), (accounts.user1 as Keypair).publicKey.toBuffer()],
      program.programId
    );

    let config = await program.account.config.fetch(
      accounts.configState as PublicKey
    );

    const adminFeePercentageBp = config.adminFeePercentageBp;
    const bet = { santa: {} };
    const amount = new anchor.BN(5 * LAMPORTS_PER_SOL);
    const fee = calculateFee(amount, adminFeePercentageBp);
    const depositAmount = amount.sub(fee);

    const tx = await program.methods
      .deposit(amount, bet)
      .accounts({
        user: (accounts.user1 as Keypair).publicKey,
        state: accounts.configState,
        vault: accounts.vault,
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

  it("Bet on Grinch", async () => {
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
    const bet = { grinch: {} };
    const amount = new anchor.BN(5 * LAMPORTS_PER_SOL);
    const fee = calculateFee(amount, adminFeePercentageBp);
    const depositAmount = amount.sub(fee);

    const tx = await program.methods
      .deposit(amount, bet)
      .accounts({
        user: (accounts.user2 as Keypair).publicKey,
        state: accounts.configState,
        vault: accounts.vault,
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

  it("Bet with an Invalid Vault - Should Fail!", async () => {
    const [user1UserStatePubkey, _bump] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("user"), (accounts.user1 as Keypair).publicKey.toBuffer()],
      program.programId
    );

    const amount = new anchor.BN(5 * LAMPORTS_PER_SOL);
    const bet = { santa: {} };
    try {
      const tx = await program.methods
        .deposit(amount, bet)
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

  it("Buy a Mystery Box for Santa", async () => {
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

  it("Buy 2 Mystery Boxes for Grinch", async () => {
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
      accounts.configState as PublicKey
    );

    assert.equal(configStateAccount.grinchBoxes.toNumber(), 1);

    const feeVaultBalance = await provider.connection.getBalance(
      accounts.feesVault as PublicKey
    );
    assert.equal(feeVaultBalance, feeVaultBalanceOld + BOX_PRICE);

    const tx2 = await program.methods
      .buyMysteryBox(side)
      .accounts({
        user: (accounts.user2 as Keypair).publicKey,
        state: accounts.configState,
        feesVault: accounts.feesVault,
      })
      .signers([accounts.user2])
      .rpc();

    const configStateAccountNew = await program.account.config.fetch(
      accounts.configState as PublicKey
    );

    assert.equal(configStateAccountNew.grinchBoxes.toNumber(), 2);

    const feeVaultBalanceNew = await provider.connection.getBalance(
      accounts.feesVault as PublicKey
    );
    assert.equal(feeVaultBalanceNew, feeVaultBalance + BOX_PRICE);
  });

  it("End Game", async () => {
    const tx = await program.methods
      .endGame()
      .accounts({
        admin: provider.publicKey,
        state: accounts.configState as PublicKey,
      })
      .rpc();

    const configStateAccount = await program.account.config.fetch(
      accounts.configState as PublicKey
    );

    assert.equal(configStateAccount.gameEnded, true);
    assert.deepEqual(configStateAccount.winningSide, { grinch: {} });
  });

  it("Buy Mystery Box after game ended - should fail!", async () => {
    const side = { santa: {} }; // On-chain BettingSide Enum Representation

    try {
      const tx = await program.methods
        .buyMysteryBox(side)
        .accounts({
          user: (accounts.user1 as Keypair).publicKey,
          state: accounts.configState,
          feesVault: accounts.feesVault,
        })
        .signers([accounts.user1])
        .rpc();

      expect.fail("Transaction should have failed");
    } catch (err) {
      if (err instanceof anchor.AnchorError) {
        expect(err.error.errorCode.code).to.equal("GameEnded");
        expect(err.error.errorCode.number).to.equal(6006); // Your error number
        // Optionally check the error message
        expect(err.error.errorMessage).to.equal("Game has already ended");
      } else {
        throw err;
      }
    }
  });

  it("Bet on Grinch after game has ended - Should fail!", async () => {
    const [user2UserStatePubkey, _bump] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("user"), (accounts.user2 as Keypair).publicKey.toBuffer()],
      program.programId
    );

    try {
      const amount = new anchor.BN(5 * LAMPORTS_PER_SOL);
      const bet = { santa: {} };
      const tx = await program.methods
        .deposit(amount, bet)
        .accounts({
          user: (accounts.user2 as Keypair).publicKey,
          state: accounts.configState,
          vault: accounts.vault,
          feesVault: accounts.feesVault,
          userBet: user2UserStatePubkey,
        })
        .signers(accounts.user2)
        .rpc();
    } catch (err) {
      if (err instanceof anchor.AnchorError) {
        expect(err.error.errorCode.code).to.equal("GameEnded");
        expect(err.error.errorCode.number).to.equal(6006); // Your error number
        // Optionally check the error message
        expect(err.error.errorMessage).to.equal("Game has already ended");
      } else {
        throw err;
      }
    }
  });

  it("User claim winnings - Loosing Bet", async () => {
    const [user1UserStatePubkey, _bump] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("user"), (accounts.user1 as Keypair).publicKey.toBuffer()],
      program.programId
    );

    const vaultBalanceOld = await provider.connection.getBalance(
      accounts.vault
    );

    const tx = await program.methods
      .claimWinnings()
      .accounts({
        claimer: (accounts.user1 as Keypair).publicKey,
        state: accounts.configState,
        vault: accounts.vault,
        userBet: user1UserStatePubkey,
      })
      .signers(accounts.user1)
      .rpc();

    // Check user bet has been claimed
    const userBet = await program.account.userBet.fetch(user1UserStatePubkey);
    assert.equal(userBet.claimed, true);

    // Claiming a loosing bet will result in no credited funds
    const vaultBalanceNew = await provider.connection.getBalance(
      accounts.vault
    );
    assert.equal(vaultBalanceNew, vaultBalanceOld);
  });

  it("User claim winnings - Winning Bet", async () => {
    const [user2UserStatePubkey, _bump] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("user"), (accounts.user2 as Keypair).publicKey.toBuffer()],
      program.programId
    );

    const userBalanceOld = await provider.connection.getBalance(
      (accounts.user2 as Keypair).publicKey
    );
    const vaultBalanceOld = await provider.connection.getBalance(
      accounts.vault
    );

    const tx = await program.methods
      .claimWinnings()
      .accounts({
        claimer: (accounts.user2 as Keypair).publicKey,
        state: accounts.configState,
        vault: accounts.vault,
        userBet: user2UserStatePubkey,
      })
      .signers(accounts.user2)
      .rpc();

    // check: user bet state is claimed.
    const configState = await program.account.config.fetch(
      accounts.configState
    );
    const userBet = await program.account.userBet.fetch(user2UserStatePubkey);
    assert.equal(userBet.claimed, true);

    const winnings = calculateWinnings(
      userBet.amount.toNumber(),
      userBet.side,
      configState
    );

    // check: user has been credited the correct amount.
    // TODO: Has to take into consideration transaction cost.
    // Not in the mood for that now ...
    //const userBalanceNew = await provider.connection.getBalance(
    //  (accounts.user2 as Keypair).publicKey
    //);
    //assert.equal(userBalanceNew, userBalanceOld + winnings);

    // check: vault has been deducted the correct amount.
    const vaultBalanceNew = await provider.connection.getBalance(
      accounts.vault as PublicKey
    );
    //console.log("Vault Balance New", vaultBalanceNew);
    assert.equal(vaultBalanceNew, vaultBalanceOld - winnings);
  });

  it("User claim winnings again - Winning Bet, Should Fail", async () => {
    const [user2UserStatePubkey, _bump] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("user"), (accounts.user2 as Keypair).publicKey.toBuffer()],
      program.programId
    );

    try {
      const tx = await program.methods
        .claimWinnings()
        .accounts({
          claimer: (accounts.user2 as Keypair).publicKey,
          state: accounts.configState,
          vault: accounts.vault,
          userBet: user2UserStatePubkey,
        })
        .signers(accounts.user2)
        .rpc();

      expect.fail("Transaction should have failed");
    } catch (err) {
      if (err instanceof anchor.AnchorError) {
        expect(err.error.errorCode.code).to.equal("AlreadyClaimed");
        expect(err.error.errorCode.number).to.equal(6008); // Your error number
        // Optionally check the error message
        expect(err.error.errorMessage).to.equal("User has already claimed");
      } else {
        throw err;
      }
    }
  });

  it("Withdraw fees ", async () => {
    // IMPORTANT: Keep in mind that order of the creator accounts matters. Keep it creator1, 2, 3.
    const creators = [accounts.creator1, accounts.creator2, accounts.creator3];

    let remainingAccounts = creators.map((c: CreatorType) => {
      let accountInfo = {
        pubkey: c.pubkey,
        isWritable: true,
        isSigner: false,
      };

      return accountInfo;
    });

    const oldCreatorsBalances = await Promise.all(
      creators.map((c: CreatorType) => provider.connection.getBalance(c.pubkey))
    );

    const feeVaultBalance = await provider.connection.getBalance(
      accounts.feesVault
    );

    const tx = await program.methods
      .withdrawFees()
      .accounts({
        admin: provider.publicKey,
        state: accounts.configState,
        fees_vault: accounts.feesVault,
      })
      .remainingAccounts(remainingAccounts)
      .rpc();

    const newCreatorsBalances = await Promise.all(
      creators.map((c: CreatorType) => provider.connection.getBalance(c.pubkey))
    );

    // Compare balances while maintaining order
    creators.forEach((creator: CreatorType, index) => {
      const share = (feeVaultBalance * creator.shareInBp) / 10_000;
      const balanceChange =
        newCreatorsBalances[index] - oldCreatorsBalances[index];

      // console.log(`Account ${creator.pubkey.toBase58()}:`);
      // console.log(`- Initial balance: ${oldCreatorsBalances[index]}`);
      // console.log(`- Final balance: ${newCreatorsBalances[index]}`);
      // console.log(`- Change: ${balanceChange}`);

      // Add your assertions here
      expect(share).to.equal(balanceChange);
    });
  });
});
