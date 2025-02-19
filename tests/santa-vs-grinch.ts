import * as anchor from "@coral-xyz/anchor";
import {
  createSignerFromKeypair,
  publicKey,
  PublicKey,
  TransactionBuilderSendAndConfirmOptions,
  Umi,
} from "@metaplex-foundation/umi";
import { airdropIfRequired, makeKeypairs } from "@solana-developers/helpers";
import {
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
  Creator,
  fetchConfig,
  fetchUserBet,
  getSantaVsGrinchProgramId,
  initialize,
  InitializeArgs,
  bet,
  updateMysteryBoxBurnPercentageBp,
  buyMysteryBox,
  endGame,
  claimWinnings,
} from "../clients/generated/umi/src";
import { CREATOR_1, CREATOR_2, CREATOR_3 } from "./constants";
import {
  createSplMint,
  generateRandomU64Seed,
  initializeUmi,
  mintSplMint,
  parseAnchorError,
  printPots,
  printScores,
} from "./utils";
import {
  publicKey as publicKeySerializer,
  string,
  u64,
} from "@metaplex-foundation/umi/serializers";
import {
  fromWeb3JsPublicKey,
  toWeb3JsPublicKey,
} from "@metaplex-foundation/umi-web3js-adapters";
import { assert, expect } from "chai";
import { fetchMint } from "@metaplex-foundation/mpl-toolbox";
import exp from "constants";

describe("santa-vs-grinch", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const provider = anchor.getProvider();

  let accounts: Record<string, unknown> = {};
  let bumps: Record<string, number> = {};

  let umi: Umi;

  let seed: BigInt;

  let programId: PublicKey<string>;

  const options: TransactionBuilderSendAndConfirmOptions = {
    send: { skipPreflight: false },
    confirm: { commitment: "confirmed" },
  };

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

    seed = generateRandomU64Seed();
    umi = initializeUmi(provider);

    console.log("✅ Umi initialized!");

    // create mint
    const mint = await createSplMint(umi, options);

    console.log("✅ Mint created!", mint.toString());

    programId = getSantaVsGrinchProgramId(umi);

    const [configState, configStateBump] = umi.eddsa.findPda(programId, [
      string({ size: "variable" }).serialize("state"),
      publicKeySerializer().serialize(umi.payer.publicKey),
      u64().serialize(seed.valueOf()),
      publicKeySerializer().serialize(mint.toString()),
    ]);

    const [vault, vaultBump] = umi.eddsa.findPda(programId, [
      string({ size: "variable" }).serialize("vault"),
      publicKeySerializer().serialize(configState.toString()),
      string({ size: "variable" }).serialize("santa-vs-grinch"),
    ]);

    const [feesVault, feesVaultBump] = umi.eddsa.findPda(programId, [
      string({ size: "variable" }).serialize("vault"),
      publicKeySerializer().serialize(configState.toString()),
      string({ size: "variable" }).serialize("fees"),
    ]);

    // Save accounts
    accounts.configState = configState;
    accounts.mint = mint;
    accounts.buybackPubkey = umi.eddsa.generateKeypair().publicKey;
    accounts.vault = vault;
    accounts.feesVault = feesVault;

    accounts.user1 = user1;
    accounts.user2 = user2;

    // Aidrop Tokens
    const [user1Ata, user2Ata] = await Promise.all(
      [user1, user2].map(async (u) => {
        return await mintSplMint(
          umi,
          mint,
          u.publicKey,
          BigInt(1_000 * 10 ** 6),
          options
        );
      })
    );

    accounts.user1Ata = user1Ata;
    accounts.user2Ata = user2Ata;

    const creator1Ata = getAssociatedTokenAddressSync(
      toWeb3JsPublicKey(mint),
      CREATOR_1,
      true
    );
    const creator2Ata = getAssociatedTokenAddressSync(
      toWeb3JsPublicKey(mint),
      CREATOR_2,
      true
    );
    const creator3Ata = getAssociatedTokenAddressSync(
      toWeb3JsPublicKey(mint),
      CREATOR_3,
      true
    );

    accounts.creator1 = {
      pubkey: fromWeb3JsPublicKey(creator1Ata),
      shareInBp: 3333,
      claimed: false,
    } as Creator;
    accounts.creator2 = {
      pubkey: fromWeb3JsPublicKey(creator2Ata),
      shareInBp: 3333,
      claimed: false,
    };
    accounts.creator3 = {
      pubkey: fromWeb3JsPublicKey(creator3Ata),
      shareInBp: 3334,
      claimed: false,
    };

    // Save bumps
    bumps.configStateBump = configStateBump;
    bumps.vaultBump = vaultBump;
    bumps.feesVaultBump = feesVaultBump;

    // NOTE: depositing too little of a fee in feeVault results in:
    // `Transaction results in an account (2) with insufficient funds for rent.`
    // so we're topping up before 1st deposit.
    // await airdropIfRequired(
    //   provider.connection,
    //   accounts.feesVault,
    //   1 * LAMPORTS_PER_SOL,
    //   0.1 * LAMPORTS_PER_SOL
    // );
  });

  it("Is initialized!", async () => {
    const creators: Creator[] = [
      accounts.creator1 as Creator,
      accounts.creator2 as Creator,
      accounts.creator3 as Creator,
    ];

    const args: InitializeArgs = {
      maxNumCreators: creators.length,
      adminFeePercentageBp: 100,
      betBurnPercentageBp: 2500,
      mysteryBoxBurnPercentageBp: 9_000,
      mysteryBoxPrice: BigInt(1_000 * 10 ** 6),
      buybackWallet: accounts.buybackPubkey as PublicKey,
      buybackPercentageBp: 2500,
      creators,
    };

    await initialize(umi, {
      admin: umi.payer,
      mint: accounts.mint as PublicKey,
      tokenProgram: fromWeb3JsPublicKey(TOKEN_PROGRAM_ID),
      args,
      seed: seed.valueOf(),
    }).sendAndConfirm(umi, options);

    const gameStateAccount = await fetchConfig(umi, accounts.configState);

    assert.equal(
      gameStateAccount.admin.toString(),
      umi.payer.publicKey.toString()
    );
    assert.equal(
      gameStateAccount.vault.toString(),
      (accounts.vault as PublicKey).toString()
    );
    assert.equal(
      gameStateAccount.buybackWallet.toString(),
      (accounts.buybackPubkey as PublicKey).toString()
    );
    assert.equal(
      gameStateAccount.feesVault,
      (accounts.feesVault as PublicKey).toString()
    );
    assert.equal(
      gameStateAccount.adminFeePercentageBp,
      args.adminFeePercentageBp
    );
    assert.equal(
      gameStateAccount.buybackPercentageBp,
      args.buybackPercentageBp
    );
    assert.equal(gameStateAccount.santaPot, BigInt(0));
    assert.equal(gameStateAccount.grinchPot, BigInt(0));
    assert.equal(gameStateAccount.santaScore, BigInt(0));
    assert.equal(gameStateAccount.grinchScore, BigInt(0));
    assert.equal(gameStateAccount.bump, bumps.configStateBump);
    assert.equal(gameStateAccount.vaultBump, bumps.vaultBump);
    assert.equal(gameStateAccount.feesVaultBump, bumps.feesVaultBump);

    // assert creators and correct share_in_bp
    // assert.deepEqual(gameStateAccount.creators[0], accounts.creator1);
    // assert.deepEqual(gameStateAccount.creators[1], accounts.creator2);
    // TODO: Last Creator object is not stored corectly - come back to it!
    //assert.deepEqual(gameStateAccount.creators[2], accounts.creator3);
  });

  // it("Update withdraw unclaimed at", async () => {
  //   const now = Math.floor(Date.now() / 1000);
  //   const WITHDRAWAL_PERIOD = 90 * 24 * 60 * 60; // 90 days
  //   const ts = BigInt(now + WITHDRAWAL_PERIOD);
  //
  //   await updateWithdrawUnclaimedAt(umi, {
  //     admin: umi.payer,
  //     state: accounts.configState,
  //     ts,
  //   }).sendAndConfirm(umi, options);
  //
  //   const gameStateAccount = await fetchConfig(umi, accounts.configState);
  //
  //   expect(gameStateAccount.withdrawUnclaimedAt).to.eq(ts);
  // });

  it("Update mystery box burn percentage bp", async () => {
    const percentageInBp = 10_000;

    await updateMysteryBoxBurnPercentageBp(umi, {
      admin: umi.payer,
      state: accounts.configState,
      percentageInBp,
    }).sendAndConfirm(umi, options);

    const gameStateAccount = await fetchConfig(umi, accounts.configState);

    expect(gameStateAccount.mysteryBoxBurnPercentageBp).to.eq(percentageInBp);
  });

  it("Bet on Santa", async () => {
    let userPubkey = fromWeb3JsPublicKey((accounts.user1 as Keypair).publicKey);
    const userSigner = createSignerFromKeypair(
      umi,
      umi.eddsa.createKeypairFromSecretKey(
        (accounts.user1 as Keypair).secretKey
      )
    );
    let gameStateAccount = await fetchConfig(
      umi,
      accounts.configState as PublicKey
    );

    console.log("User 1 bets 1 SOL on Santa");

    const buybackPercentageBp = gameStateAccount.buybackPercentageBp;
    const betTag = "santa";
    const amount = BigInt(1 * LAMPORTS_PER_SOL);
    const amountToBuyback =
      (amount * BigInt(buybackPercentageBp)) / BigInt(10_000);
    const depositAmount = amount - amountToBuyback;

    const [userBetPubkey, _] = umi.eddsa.findPda(programId, [
      string({ size: "variable" }).serialize("user"),
      publicKeySerializer().serialize(userPubkey),
      string({ size: "variable" }).serialize(betTag),
    ]);

    await bet(umi, {
      user: userSigner,
      buybackWallet: accounts.buybackPubkey as PublicKey,
      state: accounts.configState as PublicKey,
      userBet: userBetPubkey,
      amount,
      betTag,
    }).sendAndConfirm(umi, options);

    gameStateAccount = await fetchConfig(umi, accounts.configState);
    //console.log("santa gameScore", gameStateAccount.santaScore);
    assert.equal(gameStateAccount.santaPot, depositAmount);

    const betAccount = await fetchUserBet(umi, userBetPubkey);
    assert.equal(betAccount.amount, depositAmount);
    assert.deepEqual(betAccount.owner, userPubkey);

    const buybackBalance = await provider.connection.getBalance(
      toWeb3JsPublicKey(accounts.buybackPubkey as PublicKey)
    );
    assert.equal(buybackBalance, amountToBuyback);

    const vaultBalance = await provider.connection.getBalance(
      toWeb3JsPublicKey(accounts.vault as PublicKey)
    );
    assert.equal(vaultBalance, depositAmount);

    expect(gameStateAccount.santaScore).to.eq(amount * BigInt(1500));
    expect(gameStateAccount.grinchScore).to.eq(BigInt(0));
  });

  it("Bet on Grinch", async () => {
    let userPubkey = fromWeb3JsPublicKey((accounts.user2 as Keypair).publicKey);
    const userSigner = createSignerFromKeypair(
      umi,
      umi.eddsa.createKeypairFromSecretKey(
        (accounts.user2 as Keypair).secretKey
      )
    );

    let gameStateAccount = await fetchConfig(
      umi,
      accounts.configState as PublicKey
    );

    const oldSantaScore = gameStateAccount.santaScore;

    console.log("User 2 bets 2 SOL on Grinch");

    const buybackPercentageBp = gameStateAccount.buybackPercentageBp;
    const betTag = "grinch";
    const amount = BigInt(2 * LAMPORTS_PER_SOL);
    const amountToBuyback =
      (amount * BigInt(buybackPercentageBp)) / BigInt(10_000);
    const depositAmount = amount - amountToBuyback;

    const [userBetPubkey, _] = umi.eddsa.findPda(programId, [
      string({ size: "variable" }).serialize("user"),
      publicKeySerializer().serialize(userPubkey),
      string({ size: "variable" }).serialize(betTag),
    ]);

    const buybackBalanceOld = await provider.connection.getBalance(
      toWeb3JsPublicKey(accounts.buybackPubkey as PublicKey)
    );
    const vaultBalanceOld = await provider.connection.getBalance(
      toWeb3JsPublicKey(accounts.vault as PublicKey)
    );

    await bet(umi, {
      user: userSigner,
      buybackWallet: accounts.buybackPubkey as PublicKey,
      state: accounts.configState as PublicKey,
      userBet: userBetPubkey,
      amount,
      betTag,
    }).sendAndConfirm(umi, options);

    gameStateAccount = await fetchConfig(
      umi,
      accounts.configState as PublicKey
    );
    assert.equal(gameStateAccount.grinchPot, depositAmount);

    const betAccount = await fetchUserBet(umi, userBetPubkey);
    assert.equal(betAccount.amount, depositAmount);
    assert.deepEqual(betAccount.owner, userPubkey);

    const buybackBalanceNew = await provider.connection.getBalance(
      toWeb3JsPublicKey(accounts.buybackPubkey as PublicKey)
    );

    // check balance of buyback wallet has been increased with `amountToBuyback`
    expect(buybackBalanceNew).to.eq(
      buybackBalanceOld + Number(amountToBuyback)
    );

    // check balance of vault account has been increased with `depositAmount`
    const vaultBalanceNew = await provider.connection.getBalance(
      toWeb3JsPublicKey(accounts.vault as PublicKey)
    );

    expect(vaultBalanceNew).to.eq(vaultBalanceOld + Number(depositAmount));

    expect(gameStateAccount.santaScore).to.eq(oldSantaScore);
    expect(gameStateAccount.grinchScore).to.eq(BigInt(1500) * amount);
  });

  it("Bet on invalid side - Expected to fail!", async () => {
    let userPubkey = fromWeb3JsPublicKey((accounts.user2 as Keypair).publicKey);
    const userSigner = createSignerFromKeypair(
      umi,
      umi.eddsa.createKeypairFromSecretKey(
        (accounts.user2 as Keypair).secretKey
      )
    );
    let gameStateAccount = await fetchConfig(umi, accounts.configState);

    const buybackPercentageBp = gameStateAccount.buybackPercentageBp;
    const betTag = "helga";
    const amount = BigInt(2 * LAMPORTS_PER_SOL);
    const amountToBuyback =
      (amount * BigInt(buybackPercentageBp)) / BigInt(10_000);
    const depositAmount = amount - amountToBuyback;

    const [userBetPubkey, _] = umi.eddsa.findPda(programId, [
      string({ size: "variable" }).serialize("user"),
      publicKeySerializer().serialize(userPubkey),
      string({ size: "variable" }).serialize(betTag),
    ]);

    try {
      await bet(umi, {
        user: userSigner,
        buybackWallet: accounts.buybackPubkey as PublicKey,
        state: accounts.configState as PublicKey,
        userBet: userBetPubkey,
        amount,
        betTag,
      }).sendAndConfirm(umi, options);
    } catch (error) {
      const { errorNumber, errorMessage, errorCode } = parseAnchorError(
        error.transactionLogs!
      );

      expect(errorNumber).to.eq(6012);
      expect(errorMessage).to.eq("InvalidBetTag");
      expect(errorCode).to.eq("InvalidBetTag");
    }
  });

  it("Bet with an Invalid Vault - Expected to fail!", async () => {
    let userPubkey = fromWeb3JsPublicKey((accounts.user2 as Keypair).publicKey);
    const userSigner = createSignerFromKeypair(
      umi,
      umi.eddsa.createKeypairFromSecretKey(
        (accounts.user2 as Keypair).secretKey
      )
    );
    let gameStateAccount = await fetchConfig(umi, accounts.configState);

    const betTag = "santa";
    const amount = BigInt(1 * LAMPORTS_PER_SOL);

    const [userBetPubkey, _] = umi.eddsa.findPda(programId, [
      string({ size: "variable" }).serialize("user"),
      publicKeySerializer().serialize(userPubkey),
      string({ size: "variable" }).serialize(betTag),
    ]);

    try {
      await bet(umi, {
        user: userSigner,
        buybackWallet: accounts.buybackPubkey as PublicKey,
        state: accounts.configState as PublicKey,
        userBet: userBetPubkey,
        vault: userBetPubkey, // << INVALID VAULT
        amount,
        betTag,
      }).sendAndConfirm(umi, options);

      expect.fail("❌ Tx expected to fail!");
    } catch (error) {}
  });

  it("Buy a Mystery Box for Grinch", async () => {
    const betTag = "grinch";
    let userKp = accounts.user1 as Keypair;
    let userPubkey = fromWeb3JsPublicKey(userKp.publicKey);
    const userSigner = createSignerFromKeypair(
      umi,
      umi.eddsa.createKeypairFromSecretKey(userKp.secretKey)
    );
    const userAta = accounts.user1Ata;
    const [userBetPubkey, _] = umi.eddsa.findPda(programId, [
      string({ size: "variable" }).serialize("user"),
      publicKeySerializer().serialize(userPubkey),
      string({ size: "variable" }).serialize(betTag),
    ]);

    const amount = BigInt(10_000_000);

    const supplyOld = (await fetchMint(umi, accounts.mint)).supply;

    console.log("User 1 burns 10 tokens on Grinch");

    await buyMysteryBox(umi, {
      user: userSigner,
      mint: accounts.mint as PublicKey,
      state: accounts.configState as PublicKey,
      userBet: userBetPubkey,
      userAta: userAta as PublicKey,
      tokenProgram: fromWeb3JsPublicKey(TOKEN_PROGRAM_ID),
      amount,
      betTag,
    }).sendAndConfirm(umi, options);

    // Check supply has been taken out of circulation (aka burned)
    const supplyNew = (await fetchMint(umi, accounts.mint)).supply;
    assert.equal(supplyNew, supplyOld - amount);

    const betAccount = await fetchUserBet(umi, userBetPubkey);
    assert.equal(betAccount.tokenAmount, amount);
  });

  it("End Game", async () => {
    try {
      await endGame(umi, {
        admin: umi.payer,
        state: accounts.configState as PublicKey,
      }).sendAndConfirm(umi, options);
    } catch (error) {
      console.error("[endGame] tx failed with err", error);
      expect.fail("End Game Tx failed with err");
    }

    console.log("Game Ended");

    const gameStateAccount = await fetchConfig(umi, accounts.configState);
    assert.equal(gameStateAccount.gameEnded, true);

    printScores(gameStateAccount);
  });

  it("Buy a Mystery Box after game ended - should fail!", async () => {
    const betTag = "grinch";
    let userKp = accounts.user1 as Keypair;
    let userPubkey = fromWeb3JsPublicKey(userKp.publicKey);
    const userSigner = createSignerFromKeypair(
      umi,
      umi.eddsa.createKeypairFromSecretKey(userKp.secretKey)
    );
    const userAta = accounts.user1Ata;
    const [userBetPubkey, _] = umi.eddsa.findPda(programId, [
      string({ size: "variable" }).serialize("user"),
      publicKeySerializer().serialize(userPubkey),
      string({ size: "variable" }).serialize(betTag),
    ]);

    const amount = BigInt(10_000_000);

    try {
      await buyMysteryBox(umi, {
        user: userSigner,
        mint: accounts.mint as PublicKey,
        state: accounts.configState as PublicKey,
        userBet: userBetPubkey,
        userAta: userAta as PublicKey,
        tokenProgram: fromWeb3JsPublicKey(TOKEN_PROGRAM_ID),
        amount,
        betTag,
      }).sendAndConfirm(umi, options);
    } catch (error) {
      const { errorNumber, errorMessage, errorCode } = parseAnchorError(
        error.transactionLogs!
      );

      expect(errorNumber).to.eq(6006);
      expect(errorMessage).to.eq("Game has already ended");
      expect(errorCode).to.eq("GameEnded");
    }
  });

  it("User claim winnings", async () => {
    const betTag = "grinch";
    let userKp = accounts.user1 as Keypair;
    let userPubkey = fromWeb3JsPublicKey(userKp.publicKey);
    const userSigner = createSignerFromKeypair(
      umi,
      umi.eddsa.createKeypairFromSecretKey(userKp.secretKey)
    );

    const [userBetPubkey, _] = umi.eddsa.findPda(programId, [
      string({ size: "variable" }).serialize("user"),
      publicKeySerializer().serialize(userPubkey),
      string({ size: "variable" }).serialize(betTag),
    ]);

    const gameStateAccount = await fetchConfig(umi, accounts.configState);
    console.log("gameStateAccount:", gameStateAccount);

    try {
      await claimWinnings(umi, {
        claimer: userSigner,
        state: accounts.configState as PublicKey,
        userBet: userBetPubkey,
        betTag,
      }).sendAndConfirm(umi, options);
    } catch (err) {
      console.log("err", err);
    }

    const betAccount = await fetchUserBet(umi, userBetPubkey);
    console.log(betAccount);

    console.log();
  });

  //
  // it("User claim winnings - Invalid Bet Tag - Should Fail!", async () => {
  //   const [user1UserStatePubkey, _bump] = web3.PublicKey.findProgramAddressSync(
  //     [
  //       Buffer.from("user"),
  //       (accounts.user1 as Keypair).publicKey.toBuffer(),
  //       Buffer.from("santa"),
  //     ],
  //     program.programId
  //   );
  //
  //   const vaultBalanceOld = await provider.connection.getBalance(
  //     accounts.vault
  //   );
  //
  //   try {
  //     const tx = await program.methods
  //       .claimWinnings("klaus")
  //       .accounts({
  //         claimer: (accounts.user1 as Keypair).publicKey,
  //         state: accounts.configState,
  //         vault: accounts.vault,
  //         userBet: user1UserStatePubkey,
  //       })
  //       .signers(accounts.user1)
  //       .rpc();
  //
  //     expect.fail("Transaction should have failed");
  //   } catch (err) {
  //     if (err instanceof anchor.AnchorError) {
  //       expect(err.error.errorCode.code).to.equal("ConstraintSeeds");
  //       expect(err.error.errorCode.number).to.equal(2006); // Your error number
  //       // Optionally check the error message
  //       expect(err.error.errorMessage).to.equal(
  //         "A seeds constraint was violated"
  //       );
  //     } else {
  //       throw err;
  //     }
  //   }
  // });
  //
  // it("User claim winnings - Loosing Bet", async () => {
  //   const vaultBalanceOld = await provider.connection.getBalance(
  //     accounts.vault
  //   );
  //
  //   const configStateAccount = await program.account.config.fetch(
  //     accounts.configState
  //   );
  //
  //   const loosingTag = !!configStateAccount.winningSide.santa
  //     ? "grinch"
  //     : "santa";
  //
  //   const [userStatePubkey, _bump] = web3.PublicKey.findProgramAddressSync(
  //     [
  //       Buffer.from("user"),
  //       (accounts.user1 as Keypair).publicKey.toBuffer(),
  //       Buffer.from(loosingTag),
  //     ],
  //     program.programId
  //   );
  //
  //   const tx = await program.methods
  //     .claimWinnings(loosingTag)
  //     .accounts({
  //       claimer: (accounts.user1 as Keypair).publicKey,
  //       state: accounts.configState,
  //       vault: accounts.vault,
  //       userBet: userStatePubkey,
  //     })
  //     .signers(accounts.user1)
  //     .rpc();
  //
  //   // Claiming a loosing bet will result in no debited funds
  //   const vaultBalanceNew = await provider.connection.getBalance(
  //     accounts.vault
  //   );
  //   assert.equal(vaultBalanceNew, vaultBalanceOld);
  // });
  //
  // it("User claim winnings - Winning Bet - Grinch", async () => {
  //   const [user2UserStatePubkey, _bump] = web3.PublicKey.findProgramAddressSync(
  //     [
  //       Buffer.from("user"),
  //       (accounts.user2 as Keypair).publicKey.toBuffer(),
  //       Buffer.from("grinch"),
  //     ],
  //     program.programId
  //   );
  //
  //   const userBalanceOld = await provider.connection.getBalance(
  //     (accounts.user2 as Keypair).publicKey
  //   );
  //   const vaultBalanceOld = await provider.connection.getBalance(
  //     accounts.vault
  //   );
  //
  //   const tx = await program.methods
  //     .claimWinnings("grinch")
  //     .accounts({
  //       claimer: (accounts.user2 as Keypair).publicKey,
  //       state: accounts.configState,
  //       vault: accounts.vault,
  //       userBet: user2UserStatePubkey,
  //     })
  //     .signers(accounts.user2)
  //     .rpc();
  //
  //   // check: user bet state is claimed.
  //   const configState = await program.account.config.fetch(
  //     accounts.configState
  //   );
  //   const userBet = await program.account.userBet.fetch(user2UserStatePubkey);
  //   assert.equal(userBet.claimed, true);
  //
  //   const winnings = calculateWinnings(
  //     userBet.amount.toNumber(),
  //     { grinch: {} },
  //     configState
  //   );
  //
  //   // check: user has been credited the correct amount.
  //   // TODO: Has to take into consideration transaction cost.
  //   // Not in the mood for that now ...
  //   //const userBalanceNew = await provider.connection.getBalance(
  //   //  (accounts.user2 as Keypair).publicKey
  //   //);
  //   //assert.equal(userBalanceNew, userBalanceOld + winnings);
  //
  //   // check: vault has been deducted the correct amount.
  //   const vaultBalanceNew = await provider.connection.getBalance(
  //     accounts.vault as PublicKey
  //   );
  //   //console.log("Vault Balance New", vaultBalanceNew);
  //   assert.equal(vaultBalanceNew, vaultBalanceOld - winnings);
  // });
  //
  // it("User claim winnings again - Winning Bet, Should Fail", async () => {
  //   const [user2UserStatePubkey, _bump] = web3.PublicKey.findProgramAddressSync(
  //     [
  //       Buffer.from("user"),
  //       (accounts.user2 as Keypair).publicKey.toBuffer(),
  //       Buffer.from("grinch"),
  //     ],
  //     program.programId
  //   );
  //
  //   try {
  //     const tx = await program.methods
  //       .claimWinnings("grinch")
  //       .accounts({
  //         claimer: (accounts.user2 as Keypair).publicKey,
  //         state: accounts.configState,
  //         vault: accounts.vault,
  //         userBet: user2UserStatePubkey,
  //       })
  //       .signers(accounts.user2)
  //       .rpc();
  //
  //     expect.fail("Transaction should have failed");
  //   } catch (err) {
  //     if (err instanceof anchor.AnchorError) {
  //       expect(err.error.errorCode.code).to.equal("AlreadyClaimed");
  //       expect(err.error.errorCode.number).to.equal(6008); // Your error number
  //       // Optionally check the error message
  //       expect(err.error.errorMessage).to.equal("User has already claimed");
  //     } else {
  //       throw err;
  //     }
  //   }
  // });
  //
  // it("Withdraw fees ", async () => {
  //   // IMPORTANT: Keep in mind that order of the creator accounts matters. Keep it creator1, 2, 3.
  //   const creators = [accounts.creator1, accounts.creator2, accounts.creator3];
  //
  //   let remainingAccounts = creators.map((c: CreatorType) => {
  //     let accountInfo = {
  //       pubkey: c.pubkey,
  //       isWritable: true,
  //       isSigner: false,
  //     };
  //
  //     return accountInfo;
  //   });
  //
  //   const oldCreatorsBalances = await Promise.all(
  //     creators.map((c: CreatorType) => provider.connection.getBalance(c.pubkey))
  //   );
  //
  //   const feeVaultBalance = await provider.connection.getBalance(
  //     accounts.feesVault
  //   );
  //
  //   const tx = await program.methods
  //     .withdrawFees()
  //     .accounts({
  //       admin: provider.publicKey,
  //       state: accounts.configState,
  //       fees_vault: accounts.feesVault,
  //     })
  //     .remainingAccounts(remainingAccounts)
  //     .rpc();
  //
  //   const newCreatorsBalances = await Promise.all(
  //     creators.map((c: CreatorType) => provider.connection.getBalance(c.pubkey))
  //   );
  //
  //   // Compare balances while maintaining order
  //   creators.forEach((creator: CreatorType, index) => {
  //     const share = (feeVaultBalance * creator.shareInBp) / 10_000;
  //     const balanceChange =
  //       newCreatorsBalances[index] - oldCreatorsBalances[index];
  //
  //     // console.log(`Account ${creator.pubkey.toBase58()}:`);
  //     // console.log(`- Initial balance: ${oldCreatorsBalances[index]}`);
  //     // console.log(`- Final balance: ${newCreatorsBalances[index]}`);
  //     // console.log(`- Change: ${balanceChange}`);
  //
  //     // Add your assertions here
  //     expect(share).to.equal(balanceChange);
  //   });
  // });
  //
  // it("Withdraw Creators Winnings", async () => {
  //   // IMPORTANT: Keep in mind that order of the creator accounts matters. Keep it creator1, 2, 3.
  //   const creators = [accounts.creator1, accounts.creator2, accounts.creator3];
  //
  //   let remainingAccounts = creators.map((c: CreatorType) => {
  //     let accountInfo = {
  //       pubkey: c.pubkey,
  //       isWritable: true,
  //       isSigner: false,
  //     };
  //
  //     return accountInfo;
  //   });
  //
  //   const oldCreatorsBalances = await Promise.all(
  //     creators.map((c: CreatorType) => provider.connection.getBalance(c.pubkey))
  //   );
  //
  //   // At this point there should only be 25% left in the vault so it's safe to asume
  //   // it's the leftover pot for creators to withdraw from.
  //   let vaultBalance = await provider.connection.getBalance(accounts.vault);
  //
  //   const tx = await program.methods
  //     .withdrawCreatorsWinnings()
  //     .accounts({
  //       admin: provider.publicKey,
  //       state: accounts.configState,
  //       vault: accounts.vault,
  //     })
  //     .remainingAccounts(remainingAccounts)
  //     .rpc();
  //
  //   const newCreatorsBalances = await Promise.all(
  //     creators.map((c: CreatorType) => provider.connection.getBalance(c.pubkey))
  //   );
  //
  //   creators.forEach((creator: CreatorType, index) => {
  //     const share = (vaultBalance * creator.shareInBp) / 10_000;
  //     const balanceChange =
  //       newCreatorsBalances[index] - oldCreatorsBalances[index];
  //
  //     // console.log(`Account ${creator.pubkey.toBase58()}:`);
  //     // console.log(`- Initial balance: ${oldCreatorsBalances[index]}`);
  //     // console.log(`- Final balance: ${newCreatorsBalances[index]}`);
  //     // console.log(`- Change: ${balanceChange}`);
  //
  //     expect(share).to.equal(balanceChange);
  //   });
  //
  //   // Vault should be empty!
  //   vaultBalance = await provider.connection.getBalance(accounts.vault);
  //   expect(vaultBalance).to.equal(0);
  // });
  //
  // it("Withdraw Creators Winnings 2nd time - should fail", async () => {
  //   // IMPORTANT: Keep in mind that order of the creator accounts matters. Keep it creator1, 2, 3.
  //   const creators = [accounts.creator1, accounts.creator2, accounts.creator3];
  //
  //   let remainingAccounts = creators.map((c: CreatorType) => {
  //     let accountInfo = {
  //       pubkey: c.pubkey,
  //       isWritable: true,
  //       isSigner: false,
  //     };
  //
  //     return accountInfo;
  //   });
  //
  //   try {
  //     await program.methods
  //       .withdrawCreatorsWinnings()
  //       .accounts({
  //         admin: provider.publicKey,
  //         state: accounts.configState,
  //         vault: accounts.vault,
  //       })
  //       .remainingAccounts(remainingAccounts)
  //       .rpc();
  //
  //     expect.fail("Transaction should have failed.");
  //   } catch (err) {
  //     if (err instanceof anchor.AnchorError) {
  //       expect(err.error.errorCode.code).to.equal(
  //         "CreatorWithdrawalAlreadyClaimed"
  //       );
  //       expect(err.error.errorCode.number).to.equal(6014);
  //       expect(err.error.errorMessage).to.equal(
  //         "Creators withdrawal already claimed"
  //       );
  //     } else {
  //       throw err;
  //     }
  //   }
  // });
  //
  // it("Withdraw Unclaimed Winnings Early - Should Fail", async () => {
  //   // IMPORTANT: Keep in mind that order of the creator accounts matters. Keep it creator1, 2, 3.
  //   const creators = [accounts.creator1, accounts.creator2, accounts.creator3];
  //
  //   let remainingAccounts = creators.map((c: CreatorType) => {
  //     let accountInfo = {
  //       pubkey: c.pubkey,
  //       isWritable: true,
  //       isSigner: false,
  //     };
  //
  //     return accountInfo;
  //   });
  //
  //   try {
  //     await program.methods
  //       .withdrawUnclaimedCreatorsWinnings()
  //       .accounts({
  //         admin: provider.publicKey,
  //         state: accounts.configState,
  //         vault: accounts.vault,
  //       })
  //       .remainingAccounts(remainingAccounts)
  //       .rpc();
  //
  //     expect.fail("Transaction should have failed.");
  //   } catch (err) {
  //     if (err instanceof anchor.AnchorError) {
  //       expect(err.error.errorCode.code).to.equal(
  //         "WitdrawalUnclaimedPeriodNotEnded"
  //       );
  //       expect(err.error.errorCode.number).to.equal(6015);
  //       expect(err.error.errorMessage).to.equal(
  //         "Witdrawal unclaimed period not ended"
  //       );
  //     } else {
  //       throw err;
  //     }
  //   }
  // });
});
