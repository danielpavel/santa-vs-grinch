import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
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
  getOrCreateAssociatedTokenAccount,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey as Web3PublicKey,
} from "@solana/web3.js";
import {
  Creator,
  fetchConfig,
  fetchUserBet,
  getSantaVsGrinchProgramId,
  initialize,
  InitializeArgs,
  updateBetBurnPercentageBp,
  updateMysteryBoxPrice,
  updateWithdrawUnclaimedAt,
  bet,
  updateMysteryBoxBurnPercentageBp,
} from "../clients/generated/umi/src";
import { SantaVsGrinch } from "../target/types/santa_vs_grinch";
import { CREATOR_1, CREATOR_2, CREATOR_3 } from "./constants";
import {
  calculateFee,
  createSplMint,
  generateRandomU64Seed,
  initializeUmi,
  mintSplMint,
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
import { fetchMint, fetchToken } from "@metaplex-foundation/mpl-toolbox";

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
    send: { skipPreflight: true },
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
      mysteryBoxBurnPercentageBp: 10_000,
      mysteryBoxPrice: BigInt(1_000 * 10 ** 6),
      buybackWallet: accounts.buybackPubkey as PublicKey,
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
    assert.equal(gameStateAccount.santaPot, BigInt(0));
    assert.equal(gameStateAccount.santaBoxes, BigInt(0));
    assert.equal(gameStateAccount.grinchPot, BigInt(0));
    assert.equal(gameStateAccount.grinchBoxes, BigInt(0));
    assert.equal(gameStateAccount.santaMultiplier, 100);
    assert.equal(gameStateAccount.grinchMultiplier, 100);
    assert.equal(gameStateAccount.bump, bumps.configStateBump);
    assert.equal(gameStateAccount.vaultBump, bumps.vaultBump);
    assert.equal(gameStateAccount.feesVaultBump, bumps.feesVaultBump);

    // assert creators and correct share_in_bp
    // assert.deepEqual(gameStateAccount.creators[0], accounts.creator1);
    // assert.deepEqual(gameStateAccount.creators[1], accounts.creator2);
    // TODO: Last Creator object is not stored corectly - come back to it!
    //assert.deepEqual(gameStateAccount.creators[2], accounts.creator3);
  });

  it("Update withdraw unclaimed at", async () => {
    const now = Math.floor(Date.now() / 1000);
    const WITHDRAWAL_PERIOD = 90 * 24 * 60 * 60; // 90 days
    const ts = BigInt(now + WITHDRAWAL_PERIOD);

    await updateWithdrawUnclaimedAt(umi, {
      admin: umi.payer,
      state: accounts.configState,
      ts,
    }).sendAndConfirm(umi, options);

    const gameStateAccount = await fetchConfig(umi, accounts.configState);

    expect(gameStateAccount.withdrawUnclaimedAt).to.eq(ts);
  });

  it("Update mystery box price", async () => {
    const price = BigInt(10_000 * 10 ** 6);

    await updateMysteryBoxPrice(umi, {
      admin: umi.payer,
      state: accounts.configState,
      price,
    }).sendAndConfirm(umi, options);

    const gameStateAccount = await fetchConfig(umi, accounts.configState);

    expect(gameStateAccount.mysteryBoxPrice).to.eq(price);
  });

  it("Update bet burn percentage bp", async () => {
    const percentageInBp = 1100;

    await updateBetBurnPercentageBp(umi, {
      admin: umi.payer,
      state: accounts.configState,
      percentageInBp,
    }).sendAndConfirm(umi, options);

    const gameStateAccount = await fetchConfig(umi, accounts.configState);

    expect(gameStateAccount.betBurnPercentageBp).to.eq(percentageInBp);
  });

  it("Update mystery box burn percentage bp", async () => {
    const percentageInBp = 2200;

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
    let userAta = fromWeb3JsPublicKey(accounts.user1Ata);
    let gameStateAccount = await fetchConfig(umi, accounts.configState);

    const betBurnPercentageBp = gameStateAccount.betBurnPercentageBp;
    const betTag = "santa";
    const amount = BigInt(100 * 10 ** 6);
    const amountToBeBurned =
      (amount * BigInt(betBurnPercentageBp)) / BigInt(10_000);
    const depositAmount = amount - amountToBeBurned;

    const [userBetPubkey, _] = umi.eddsa.findPda(programId, [
      string({ size: "variable" }).serialize("user"),
      publicKeySerializer().serialize(userPubkey),
      string({ size: "variable" }).serialize(betTag),
    ]);

    await bet(umi, {
      user: userSigner,
      mint: accounts.mint as PublicKey,
      state: accounts.configState as PublicKey,
      userBet: userBetPubkey,
      userAta,
      tokenProgram: fromWeb3JsPublicKey(TOKEN_PROGRAM_ID),
      amount,
      betTag,
    }).sendAndConfirm(umi, options);

    gameStateAccount = await fetchConfig(umi, accounts.configState);
    assert.equal(gameStateAccount.santaPot, depositAmount);

    const betAccount = await fetchUserBet(umi, userBetPubkey);
    assert.equal(betAccount.amount, depositAmount);
    assert.deepEqual(betAccount.owner, userPubkey);
  });

  // it("Bet on Grinch", async () => {
  //   const [user2UserStatePubkey, _bump] = web3.PublicKey.findProgramAddressSync(
  //     [
  //       Buffer.from("user"),
  //       (accounts.user2 as Keypair).publicKey.toBuffer(),
  //       Buffer.from("grinch"),
  //     ],
  //     program.programId
  //   );
  //
  //   const feeVaultBalanceOld = await provider.connection.getBalance(
  //     accounts.feesVault
  //   );
  //
  //   let config = await program.account.config.fetch(
  //     accounts.configState as PublicKey
  //   );
  //
  //   const adminFeePercentageBp = config.adminFeePercentageBp;
  //   const betTag = "grinch";
  //   const amount = new anchor.BN(5 * LAMPORTS_PER_SOL);
  //   const fee = calculateFee(amount, adminFeePercentageBp);
  //   const depositAmount = amount.sub(fee);
  //
  //   const tx = await program.methods
  //     .bet(amount, betTag)
  //     .accounts({
  //       user: (accounts.user2 as Keypair).publicKey,
  //       state: accounts.configState,
  //       vault: accounts.vault,
  //       feesVault: accounts.feesVault,
  //       userBet: user2UserStatePubkey,
  //     })
  //     .signers(accounts.user2)
  //     .rpc();
  //
  //   const feeVaultBalance = await provider.connection.getBalance(
  //     accounts.feesVault
  //   );
  //   assert.equal(feeVaultBalance, feeVaultBalanceOld + fee.toNumber());
  //
  //   config = await program.account.config.fetch(
  //     accounts.configState as PublicKey
  //   );
  //   assert.equal(config.grinchPot.toNumber(), depositAmount.toNumber());
  //
  //   const user2UserStateAccount = await program.account.userBet.fetch(
  //     user2UserStatePubkey
  //   );
  //
  //   assert.equal(
  //     user2UserStateAccount.amount.toNumber(),
  //     depositAmount.toNumber()
  //   );
  //   assert.deepEqual(
  //     user2UserStateAccount.owner,
  //     (accounts.user2 as Keypair).publicKey
  //   );
  // });
  //
  // it("Bet on Invalid Side", async () => {
  //   const [user2UserStatePubkey, _bump] = web3.PublicKey.findProgramAddressSync(
  //     [
  //       Buffer.from("user"),
  //       (accounts.user2 as Keypair).publicKey.toBuffer(),
  //       Buffer.from("helga"),
  //     ],
  //     program.programId
  //   );
  //
  //   const betTag = "grinch";
  //   const amount = new anchor.BN(5 * LAMPORTS_PER_SOL);
  //
  //   try {
  //     const tx = await program.methods
  //       .bet(amount, betTag)
  //       .accounts({
  //         user: (accounts.user2 as Keypair).publicKey,
  //         state: accounts.configState,
  //         vault: accounts.vault,
  //         feesVault: accounts.feesVault,
  //         userBet: user2UserStatePubkey,
  //       })
  //       .signers(accounts.user2)
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
  // it("Bet with an Invalid Vault - Should Fail!", async () => {
  //   const [user1UserStatePubkey, _bump] = web3.PublicKey.findProgramAddressSync(
  //     [
  //       Buffer.from("user"),
  //       (accounts.user1 as Keypair).publicKey.toBuffer(),
  //       Buffer.from("santa"),
  //     ],
  //     program.programId
  //   );
  //
  //   const amount = new anchor.BN(5 * LAMPORTS_PER_SOL);
  //   const betTag = "santa";
  //   try {
  //     const tx = await program.methods
  //       .bet(amount, betTag)
  //       .accounts({
  //         user: (accounts.user1 as Keypair).publicKey,
  //         state: accounts.configState,
  //         vault: PublicKey.unique(),
  //         feesVault: accounts.feesVault,
  //         userBet: user1UserStatePubkey,
  //       })
  //       .signers(accounts.user1)
  //       .rpc();
  //
  //     expect.fail("Transaction should have failed");
  //   } catch (err) {
  //     if (err instanceof anchor.AnchorError) {
  //       expect(err.error.errorCode.code).to.equal("InvalidVaultDepositAccount");
  //       expect(err.error.errorCode.number).to.equal(6000); // Your error number
  //       // Optionally check the error message
  //       expect(err.error.errorMessage).to.equal(
  //         "Invalid deposit vault account"
  //       );
  //     } else {
  //       throw err;
  //     }
  //   }
  // });
  //
  // it("Buy a Mystery Box for Santa", async () => {
  //   const [user1UserStatePubkey, _bump] = web3.PublicKey.findProgramAddressSync(
  //     [
  //       Buffer.from("user"),
  //       (accounts.user1 as Keypair).publicKey.toBuffer(),
  //       Buffer.from("santa"),
  //     ],
  //     program.programId
  //   );
  //
  //   const side = "santa"; // On-chain BettingSide Enum Representation
  //   const BOX_PRICE = 500_000_000;
  //
  //   let feeVaultBalanceOld = await provider.connection.getBalance(
  //     accounts.feesVault
  //   );
  //
  //   const tx = await program.methods
  //     .buyMysteryBox(side)
  //     .accounts({
  //       user: (accounts.user1 as Keypair).publicKey,
  //       state: accounts.configState,
  //       feesVault: accounts.feesVault,
  //       userBet: user1UserStatePubkey,
  //     })
  //     .signers([accounts.user1])
  //     .rpc();
  //
  //   const configStateAccount = await program.account.config.fetch(
  //     accounts.configState
  //   );
  //
  //   assert.equal(configStateAccount.santaBoxes.toNumber(), 1);
  //
  //   const feeVaultBalance = await provider.connection.getBalance(
  //     accounts.feesVault
  //   );
  //   assert.equal(feeVaultBalance, feeVaultBalanceOld + BOX_PRICE);
  //
  //   const user1UserStateAccount = await program.account.userBet.fetch(
  //     user1UserStatePubkey
  //   );
  //
  //   assert.equal(user1UserStateAccount.mysterBoxCount, 1);
  // });
  //
  // it("Buy 2 Mystery Boxes for Grinch", async () => {
  //   const [user2UserStatePubkey, _bump] = web3.PublicKey.findProgramAddressSync(
  //     [
  //       Buffer.from("user"),
  //       (accounts.user2 as Keypair).publicKey.toBuffer(),
  //       Buffer.from("grinch"),
  //     ],
  //     program.programId
  //   );
  //
  //   const side = "grinch"; // On-chain BettingSide Enum Representation
  //   const BOX_PRICE = 500_000_000;
  //
  //   let feeVaultBalanceOld = await provider.connection.getBalance(
  //     accounts.feesVault
  //   );
  //
  //   await program.methods
  //     .buyMysteryBox(side)
  //     .accounts({
  //       user: (accounts.user2 as Keypair).publicKey,
  //       state: accounts.configState,
  //       feesVault: accounts.feesVault,
  //       userBet: user2UserStatePubkey,
  //     })
  //     .signers([accounts.user2])
  //     .rpc();
  //
  //   const configStateAccount = await program.account.config.fetch(
  //     accounts.configState as PublicKey
  //   );
  //
  //   assert.equal(configStateAccount.grinchBoxes.toNumber(), 1);
  //
  //   const feeVaultBalance = await provider.connection.getBalance(
  //     accounts.feesVault as PublicKey
  //   );
  //   assert.equal(feeVaultBalance, feeVaultBalanceOld + BOX_PRICE);
  //
  //   let user2UserStateAccount = await program.account.userBet.fetch(
  //     user2UserStatePubkey
  //   );
  //
  //   assert.equal(user2UserStateAccount.mysterBoxCount, 1);
  //
  //   await program.methods
  //     .buyMysteryBox(side)
  //     .accounts({
  //       user: (accounts.user2 as Keypair).publicKey,
  //       state: accounts.configState,
  //       feesVault: accounts.feesVault,
  //     })
  //     .signers([accounts.user2])
  //     .rpc();
  //
  //   const configStateAccountNew = await program.account.config.fetch(
  //     accounts.configState as PublicKey
  //   );
  //
  //   assert.equal(configStateAccountNew.grinchBoxes.toNumber(), 2);
  //
  //   const feeVaultBalanceNew = await provider.connection.getBalance(
  //     accounts.feesVault as PublicKey
  //   );
  //   assert.equal(feeVaultBalanceNew, feeVaultBalance + BOX_PRICE);
  //
  //   user2UserStateAccount = await program.account.userBet.fetch(
  //     user2UserStatePubkey
  //   );
  //
  //   assert.equal(user2UserStateAccount.mysterBoxCount, 2);
  // });
  //
  // it("End Game", async () => {
  //   const tx = await program.methods
  //     .endGame()
  //     .accounts({
  //       admin: provider.publicKey,
  //       state: accounts.configState as PublicKey,
  //       recentSlothashes: new PublicKey(
  //         "SysvarS1otHashes111111111111111111111111111"
  //       ),
  //     })
  //     .rpc();
  //
  //   const configStateAccount = await program.account.config.fetch(
  //     accounts.configState as PublicKey
  //   );
  //
  //   console.log("... winning_side", configStateAccount.winningSide);
  //
  //   assert.equal(configStateAccount.gameEnded, true);
  // });
  //
  // it("Buy Mystery Box after game ended - should fail!", async () => {
  //   const [user2UserStatePubkey, _bump] = web3.PublicKey.findProgramAddressSync(
  //     [
  //       Buffer.from("user"),
  //       (accounts.user1 as Keypair).publicKey.toBuffer(),
  //       Buffer.from("grinch"),
  //     ],
  //     program.programId
  //   );
  //
  //   const side = "grinch";
  //
  //   try {
  //     const tx = await program.methods
  //       .buyMysteryBox(side)
  //       .accounts({
  //         user: (accounts.user1 as Keypair).publicKey,
  //         state: accounts.configState,
  //         feesVault: accounts.feesVault,
  //         userBet: user2UserStatePubkey,
  //       })
  //       .signers([accounts.user1])
  //       .rpc();
  //
  //     expect.fail("Transaction should have failed");
  //   } catch (err) {
  //     if (err instanceof anchor.AnchorError) {
  //       expect(err.error.errorCode.code).to.equal("GameEnded");
  //       expect(err.error.errorCode.number).to.equal(6006); // Your error number
  //       // Optionally check the error message
  //       expect(err.error.errorMessage).to.equal("Game has already ended");
  //     } else {
  //       throw err;
  //     }
  //   }
  // });
  //
  // it("Bet on Grinch after game has ended - Should fail!", async () => {
  //   const [user2UserStatePubkey, _bump] = web3.PublicKey.findProgramAddressSync(
  //     [
  //       Buffer.from("user"),
  //       (accounts.user2 as Keypair).publicKey.toBuffer(),
  //       Buffer.from("santa"),
  //     ],
  //     program.programId
  //   );
  //
  //   try {
  //     const amount = new anchor.BN(5 * LAMPORTS_PER_SOL);
  //     const betTag = "santa";
  //     const tx = await program.methods
  //       .bet(amount, betTag)
  //       .accounts({
  //         user: (accounts.user2 as Keypair).publicKey,
  //         state: accounts.configState,
  //         vault: accounts.vault,
  //         feesVault: accounts.feesVault,
  //         userBet: user2UserStatePubkey,
  //       })
  //       .signers(accounts.user2)
  //       .rpc();
  //
  //     expect.fail("Transaction should have failed");
  //   } catch (err) {
  //     if (err instanceof anchor.AnchorError) {
  //       expect(err.error.errorCode.code).to.equal("GameEnded");
  //       expect(err.error.errorCode.number).to.equal(6006); // Your error number
  //       // Optionally check the error message
  //       expect(err.error.errorMessage).to.equal("Game has already ended");
  //     } else {
  //       throw err;
  //     }
  //   }
  // });
  //
  // it("User claim winnings - Invalid UserBet PDA - Should Fail!", async () => {
  //   const [user1UserStatePubkey, _bump] = web3.PublicKey.findProgramAddressSync(
  //     [
  //       Buffer.from("user"),
  //       (accounts.user1 as Keypair).publicKey.toBuffer(),
  //       Buffer.from("klaus"),
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
  //       .claimWinnings("santa")
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
  //       expect(err.error.errorCode.code).to.equal("AccountNotInitialized");
  //       expect(err.error.errorCode.number).to.equal(3012); // Your error number
  //       // Optionally check the error message
  //       expect(err.error.errorMessage).to.equal(
  //         "The program expected this account to be already initialized"
  //       );
  //     } else {
  //       throw err;
  //     }
  //   }
  // });
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
