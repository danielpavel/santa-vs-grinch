import { Command } from "commander";
import { web3 } from "@coral-xyz/anchor";
import { clusterApiUrl } from "@solana/web3.js";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import path from "path";
import { getKeypairFromFile } from "@solana-developers/helpers";
import {
  createSignerFromKeypair,
  keypairIdentity,
  publicKey,
  TransactionBuilderSendAndConfirmOptions,
  Umi,
  PublicKey as UmiPublicKey,
} from "@metaplex-foundation/umi";
import fs from "fs";

import {
  base58,
  publicKey as publicKeySerializer,
  string,
  u64,
} from "@metaplex-foundation/umi/serializers";
import {
  bet,
  buyMysteryBox,
  fetchConfig,
  fetchUserBet,
  getSantaVsGrinchProgramId,
  InitializeArgs,
  updateBetBuybackPercentageBp,
  claimWinnings,
  betV2,
  claimWinningsV2,
  buyMysteryBoxV2,
  safeFetchConfig,
  endGame,
  getConfigGpaBuilder,
  initialize,
} from "../clients/generated/umi/src";
import {
  findAssociatedTokenPda,
  mplToolbox,
  SPL_TOKEN_PROGRAM_ID,
} from "@metaplex-foundation/mpl-toolbox";
import {
  mintV1,
  mplTokenMetadata,
  TokenStandard,
} from "@metaplex-foundation/mpl-token-metadata";

const CONFIG_FNAME = "cli/initialize_config.json";

const opts: TransactionBuilderSendAndConfirmOptions = {
  confirm: { commitment: "confirmed" },
};

function generateRandomU64Seed() {
  const randomBytes = web3.Keypair.generate().secretKey.slice(0, 8);

  let view = new DataView(randomBytes.buffer, 0);
  return view.getBigUint64(0, true);
}

async function mintSplMint(
  umi: Umi,
  mint: UmiPublicKey,
  owner: UmiPublicKey,
  amount: bigint,
  options
) {
  try {
    const ata = findAssociatedTokenPda(umi, { mint, owner });

    await mintV1(umi, {
      mint: mint,
      authority: umi.payer,
      amount,
      tokenOwner: owner,
      tokenStandard: TokenStandard.Fungible,
    }).sendAndConfirm(umi, options);

    return ata;
  } catch (error) {
    console.error("Error minting mint:", error);
    throw error;
  }
}

// Initialize Commander
const program = new Command();

// Configure CLI metadata
program
  .name("santa-vs-grinch-cli")
  .description("CLI to interact with Santa vs Grinch Solana program")
  .version("0.1.0");

// Utility Functions
const initializePrereqs = async () => {
  const umi = createUmi(clusterApiUrl("devnet"), {
    commitment: "confirmed",
  });

  const keypairPath = path.join(process.cwd(), "./keypairs/admin.json");

  const kp = await getKeypairFromFile(keypairPath);
  const admin = umi.eddsa.createKeypairFromSecretKey(kp.secretKey);

  umi.use(keypairIdentity(admin));
  umi.use(mplTokenMetadata());
  umi.use(mplToolbox());

  return { umi, programId: getSantaVsGrinchProgramId(umi) };
};

// const seed = BigInt(12958056478283855875);
// const mint = publicKey("AMhgLQcYuiStFWepRqJ9t64XxA5GFkH1Nr9vVfDrpump");
const mint = publicKey("5bEjR2Taido5JNM4v45yK8f93PvHNnwwWP5GvtnTD637");

// State Monitoring Commands
program
  .command("mint-tokens")
  .requiredOption("-o, --owner <pubkey>", "Public key of the owner.")
  .requiredOption("-m, --mint <pubkey>", "Mint")
  .requiredOption("-a, --amount <pubkey>", "Amount of tokens")
  .action(async (options) => {
    try {
      const { umi } = await initializePrereqs();

      const amount = BigInt(options.amount);
      const owner = publicKey(options.owner);
      const mint = publicKey(options.mint);

      console.log("Minting tokens to", owner.toString());

      await mintSplMint(umi, mint, owner, amount * BigInt(10 ** 6), opts);

      console.log("✅ Done");
    } catch (error) {
      console.error("❌ Error:", error);
    }
  });

// State Monitoring Commands
program
  .command("get-game-state")
  .description("Get the current state of the game")
  .requiredOption("-a, --address <pubkey>", "Public key of config account")
  .action(async (options) => {
    try {
      const { umi, programId } = await initializePrereqs();

      console.log("Fetching state...", options.address);

      const configStateAccount = await fetchConfig(
        umi,
        publicKey(options.address)
      );

      console.log(configStateAccount);
    } catch (error) {
      console.error("Error:", error);
    }
  });

program
  .command("get-all-game-state-accounts")
  .description("Get all the game state account")
  .action(async () => {
    try {
      const { umi } = await initializePrereqs();

      console.log("Fetching all game state accoutns...");

      const gameStateAccounts = await getConfigGpaBuilder(
        umi
      ).getDeserialized();

      if (gameStateAccounts.length === 0) {
        console.log("No game state accounts found!");
        return;
      }

      gameStateAccounts.map((game) => {
        console.log(game.publicKey.toString());
      });
    } catch (error) {
      console.error("Error:", error);
    }
  });

program
  .command("get-user-bet")
  .description("Get user bet information")
  .requiredOption("-u, --user <pubkey>", "User public key")
  .requiredOption("-t, --tag <string>", "Bet tag")
  .action(async (options) => {
    try {
      const { umi, programId } = await initializePrereqs();

      const userPubkey = publicKey(options.user);

      const [userBetPubkey] = umi.eddsa.findPda(programId, [
        string({ size: "variable" }).serialize("user"),
        publicKeySerializer().serialize(userPubkey),
        string({ size: "variable" }).serialize(options.tag),
      ]);

      console.log("Fetching user bet...");
      try {
        const userBetAccount = await fetchUserBet(umi, userBetPubkey);
        console.log(userBetAccount);
      } catch (err) {
        console.log(`There's no userBet at address: ${userBetPubkey}`);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  });

program
  .command("get-user-bet-v2")
  .description("Get user bet information")
  .requiredOption("-u, --user <pubkey>", "User public key")
  .requiredOption("-g, --game <pubkey>", "Game state publicKey")
  .requiredOption("-t, --tag <string>", "Bet tag")
  .action(async (options) => {
    try {
      const { umi, programId } = await initializePrereqs();

      const userPubkey = publicKey(options.user);
      const gameState = publicKey(options.game);

      const [userBetPubkey] = umi.eddsa.findPda(programId, [
        string({ size: "variable" }).serialize("user"),
        publicKeySerializer().serialize(userPubkey),
        publicKeySerializer().serialize(gameState),
        string({ size: "variable" }).serialize(options.tag),
      ]);

      console.log("Fetching user bet...");
      try {
        const userBetAccount = await fetchUserBet(umi, userBetPubkey);
        console.log(userBetAccount);
      } catch (err) {
        console.log(`There's no userBet at address: ${userBetPubkey}`);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  });

program
  .command("bet")
  .description("Place a bet")
  .requiredOption("-k, --keypair <keypair>", "User Keypair")
  .requiredOption("-a, --amount <number>", "Bet amount in lamports")
  .requiredOption("-t, --tag <string>", "Bet tag (santa/grinch).")
  .requiredOption("-g, --game <pubkey>", "Game state publicKey")
  .action(async (options) => {
    try {
      const { umi, programId } = await initializePrereqs();
      const tag = options.tag;
      const amount = BigInt(options.amount);
      const gameState = publicKey(options.game);

      if (tag != "grinch" && tag != "santa") {
        throw new Error(`Invalid ${tag} tag. Should be "santa" | "grinch"`);
      }

      const userKeypairPath = path.join(process.cwd(), options.keypair);
      const userKp = await getKeypairFromFile(userKeypairPath);
      const userSigner = createSignerFromKeypair(
        umi,
        umi.eddsa.createKeypairFromSecretKey(userKp.secretKey)
      );

      const [userBetPubkey] = umi.eddsa.findPda(programId, [
        string({ size: "variable" }).serialize("user"),
        publicKeySerializer().serialize(userSigner.publicKey),
        string({ size: "variable" }).serialize(tag),
      ]);

      console.log("Placing bet...");

      await bet(umi, {
        user: userSigner,
        buybackWallet: userSigner.publicKey,
        state: gameState,
        userBet: userBetPubkey,
        amount,
        betTag: tag,
      }).sendAndConfirm(umi, options);

      console.log("✅ Done!");
    } catch (error) {
      console.error("Error:", error);
    }
  });

program
  .command("bet-v2")
  .description("Place a bet")
  .requiredOption("-k, --keypair <keypair>", "User Keypair")
  .requiredOption("-a, --amount <number>", "Bet amount in lamports")
  .requiredOption("-t, --tag <string>", "Bet tag (santa/grinch).")
  .requiredOption("-g, --game <pubkey>", "Game state publicKey")
  .action(async (options) => {
    try {
      const { umi, programId } = await initializePrereqs();
      const tag = options.tag;
      const amount = BigInt(options.amount);
      const gameState = publicKey(options.game);

      if (tag != "grinch" && tag != "santa") {
        throw new Error(`Invalid ${tag} tag. Should be "santa" | "grinch"`);
      }

      const userKeypairPath = path.join(process.cwd(), options.keypair);
      const userKp = await getKeypairFromFile(userKeypairPath);
      const userSigner = createSignerFromKeypair(
        umi,
        umi.eddsa.createKeypairFromSecretKey(userKp.secretKey)
      );

      const [userBetPubkey] = umi.eddsa.findPda(programId, [
        string({ size: "variable" }).serialize("user"),
        publicKeySerializer().serialize(userSigner.publicKey),
        publicKeySerializer().serialize(gameState),
        string({ size: "variable" }).serialize(tag),
      ]);

      //Fetch game state so we get buyback publicKey.
      const gameStateAccount = await safeFetchConfig(umi, gameState);
      if (!gameStateAccount) {
        throw new Error(`Could not find game state at ${gameState.toString()}`);
      }

      console.log("Placing bet...");

      const ret = await betV2(umi, {
        user: userSigner,
        buybackWallet: gameStateAccount.buybackWallet,
        state: gameState,
        userBet: userBetPubkey,
        amount,
        betTag: tag,
      }).sendAndConfirm(umi, options);

      console.log("✅ Done with sig:", base58.deserialize(ret.signature)[0]);
    } catch (error) {
      console.error("Error:", error);
    }
  });

program
  .command("update-buyback-percentage")
  .description("Update buyback percentage")
  .requiredOption("-a, --address <pubkey>", "Public key of config account")
  .requiredOption("-v, --value <number>", "Buyback percentage in basis points")
  .action(async (options) => {
    try {
      const { umi } = await initializePrereqs();
      const percentageInBp = Number(options.value);
      const configState = publicKey(options.address);

      if (percentageInBp < 0 || percentageInBp > 10_000) {
        throw new Error(
          `Invalid ${percentageInBp} percentage. Should be between 0 and 10 000`
        );
      }

      console.log("Updateing bet buyback percentage...");

      await updateBetBuybackPercentageBp(umi, {
        admin: umi.payer,
        state: configState,
        percentageInBp,
      }).sendAndConfirm(umi, opts);

      console.log("✅ Done!");
    } catch (error) {
      console.error("Error:", error);
    }
  });

program
  .command("update-burn-percentage")
  .description("Update buyback percentage")
  .requiredOption("-a, --address <pubkey>", "Public key of config account")
  .requiredOption("-v, --value <number>", "Buyback percentage in basis points")
  .action(async (options) => {
    try {
      const { umi } = await initializePrereqs();
      const percentageInBp = Number(options.value);
      const configState = publicKey(options.address);

      if (percentageInBp < 0 || percentageInBp > 10_000) {
        throw new Error(
          `Invalid ${percentageInBp} percentage. Should be between 0 and 10 000`
        );
      }

      console.log("Updateing bet buyback percentage...");

      await updateBetBuybackPercentageBp(umi, {
        admin: umi.payer,
        state: configState,
        percentageInBp,
      }).sendAndConfirm(umi, opts);

      console.log("✅ Done!");
    } catch (error) {
      console.error("Error:", error);
    }
  });

program
  .command("buy-mystery-box-v2")
  .description("Buy a mystery box")
  .requiredOption("-k, --keypair <keypair.json>", "User wallet")
  .requiredOption("-t, --tag <string>", "Bet tag")
  .requiredOption("-a, --amount <number>", "Token amount")
  .requiredOption("-g, --game <pubkey>", "Game state publicKey")
  .action(async (options) => {
    try {
      const { umi, programId } = await initializePrereqs();
      const tag = options.tag;
      const amount = BigInt(options.amount);
      const gameState = publicKey(options.game);

      if (tag != "grinch" && tag != "santa") {
        throw new Error(`Invalid ${tag} tag. Should be "santa" | "grinch"`);
      }

      const gameStateAccount = await safeFetchConfig(umi, gameState);
      if (!gameStateAccount) {
        throw new Error(`Could not find game state at ${gameState.toString()}`);
      }

      const userKeypairPath = path.join(process.cwd(), options.keypair);
      const userKp = await getKeypairFromFile(userKeypairPath);
      const userSigner = createSignerFromKeypair(
        umi,
        umi.eddsa.createKeypairFromSecretKey(userKp.secretKey)
      );

      const [userBetPubkey] = umi.eddsa.findPda(programId, [
        string({ size: "variable" }).serialize("user"),
        publicKeySerializer().serialize(userSigner.publicKey),
        publicKeySerializer().serialize(gameStateAccount.publicKey),
        string({ size: "variable" }).serialize(tag),
      ]);

      const [ata] = findAssociatedTokenPda(umi, {
        mint: gameStateAccount.mint,
        owner: userSigner.publicKey,
      });

      console.log("Buying mystery box...");

      const result = await buyMysteryBoxV2(umi, {
        user: userSigner,
        mint: gameStateAccount.mint,
        state: gameState,
        userBet: userBetPubkey,
        userAta: ata,
        tokenProgram: SPL_TOKEN_PROGRAM_ID,
        betTag: tag,
        amount: BigInt(amount) * BigInt(10 ** 6),
      }).sendAndConfirm(umi, opts);

      console.log("✅ Done with sig:", base58.deserialize(result.signature)[0]);
    } catch (error) {
      console.error("Error:", error);
    }
  });

program
  .command("buy-mystery-box")
  .description("Buy a mystery box")
  .requiredOption("-k, --keypair <keypair.json>", "User wallet")
  .requiredOption("-t, --tag <string>", "Bet tag")
  .requiredOption("-a, --amount <number>", "Token amount")
  .requiredOption("-g, --game <pubkey>", "Game state publicKey")
  .action(async (options) => {
    try {
      const { umi } = await initializePrereqs();
      const tag = options.tag;
      const amount = BigInt(options.amount);
      const gameState = publicKey(options.game);

      if (tag != "grinch" && tag != "santa") {
        throw new Error(`Invalid ${tag} tag. Should be "santa" | "grinch"`);
      }

      const gameStateAccount = await safeFetchConfig(umi, gameState);
      if (!gameStateAccount) {
        throw new Error(`Could not find game state at ${gameState.toString()}`);
      }

      const userKeypairPath = path.join(process.cwd(), options.keypair);
      const userKp = await getKeypairFromFile(userKeypairPath);
      const userSigner = createSignerFromKeypair(
        umi,
        umi.eddsa.createKeypairFromSecretKey(userKp.secretKey)
      );

      const [userBetPubkey] = umi.eddsa.findPda(program, [
        string({ size: "variable" }).serialize("user"),
        publicKeySerializer().serialize(userSigner.publicKey),
        string({ size: "variable" }).serialize(tag),
      ]);

      const [ata] = findAssociatedTokenPda(umi, {
        mint: gameStateAccount.mint,
        owner: userSigner.publicKey,
      });

      console.log("Buying mystery box...");

      const result = await buyMysteryBox(umi, {
        user: userSigner,
        mint: gameStateAccount.mint,
        state: gameState,
        userBet: userBetPubkey,
        userAta: ata,
        tokenProgram: SPL_TOKEN_PROGRAM_ID,
        betTag: tag,
        amount: BigInt(amount) * BigInt(10 ** 6),
      }).sendAndConfirm(umi, opts);

      console.log(
        "✅ Done with sig: ",
        base58.deserialize(result.signature)[0]
      );
    } catch (error) {
      console.error("Error:", error);
    }
  });

program
  .command("claim-winnings")
  .description("Claim winnings")
  .requiredOption("-k, --keypair <keypair>", "User Keypair")
  .requiredOption("-t, --tag <string>", "Bet tag (santa/grinch).")
  .requiredOption("-g, --game <pubkey>", "Game state publicKey")
  .action(async (options) => {
    try {
      const { umi, programId } = await initializePrereqs();
      const tag = options.tag;
      const gameState = publicKey(options.game);

      if (tag != "grinch" && tag != "santa") {
        throw new Error(`Invalid ${tag} tag. Should be "santa" | "grinch"`);
      }

      const userKeypairPath = path.join(process.cwd(), options.keypair);
      const userKp = await getKeypairFromFile(userKeypairPath);
      const userSigner = createSignerFromKeypair(
        umi,
        umi.eddsa.createKeypairFromSecretKey(userKp.secretKey)
      );

      const [userBetPubkey] = umi.eddsa.findPda(programId, [
        string({ size: "variable" }).serialize("user"),
        publicKeySerializer().serialize(userSigner.publicKey),
        string({ size: "variable" }).serialize(tag),
      ]);

      console.log("Claim winnings...");

      const result = await claimWinnings(umi, {
        claimer: userSigner,
        state: gameState,
        userBet: userBetPubkey,
        betTag: tag,
      }).sendAndConfirm(umi, options);

      console.log(
        "✅ Done with sig: ",
        base58.deserialize(result.signature)[0]
      );
    } catch (error) {
      console.error("Error:", error);
    }
  });

program
  .command("claim-winnings-v2")
  .description("Claim winnings")
  .requiredOption("-k, --keypair <keypair>", "User Keypair")
  .requiredOption("-t, --tag <string>", "Bet tag (santa/grinch).")
  .requiredOption("-g, --game <pubkey>", "Game state publicKey")
  .action(async (options) => {
    try {
      const { umi, programId } = await initializePrereqs();
      const tag = options.tag;
      const gameState = publicKey(options.game);

      if (tag != "grinch" && tag != "santa") {
        throw new Error(`Invalid ${tag} tag. Should be "santa" | "grinch"`);
      }

      const userKeypairPath = path.join(process.cwd(), options.keypair);
      const userKp = await getKeypairFromFile(userKeypairPath);
      const userSigner = createSignerFromKeypair(
        umi,
        umi.eddsa.createKeypairFromSecretKey(userKp.secretKey)
      );

      const [userBetPubkey] = umi.eddsa.findPda(programId, [
        string({ size: "variable" }).serialize("user"),
        publicKeySerializer().serialize(userSigner.publicKey),
        publicKeySerializer().serialize(gameState),
        string({ size: "variable" }).serialize(tag),
      ]);

      console.log("Claim winnings...");

      const result = await claimWinningsV2(umi, {
        claimer: userSigner,
        state: gameState,
        userBet: userBetPubkey,
        betTag: tag,
      }).sendAndConfirm(umi, options);

      console.log(
        "✅ Done with sig: ",
        base58.deserialize(result.signature)[0]
      );
      console.log("✅ Done!");
    } catch (error) {
      console.error("Error:", error);
    }
  });

program
  .command("end-game")
  .description("End the game")
  .requiredOption("-g, --game <pubkey>", "Game state publicKey")
  .action(async (options) => {
    try {
      const { umi } = await initializePrereqs();
      const gameState = publicKey(options.game);

      console.log("Ending game...");
      const result = await endGame(umi, {
        admin: umi.payer,
        state: gameState,
      }).sendAndConfirm(umi, options);

      console.log(
        "✅ Done with sig: ",
        base58.deserialize(result.signature)[0]
      );
    } catch (error) {
      console.error("Error:", error);
    }
  });

program
  .command("initialize")
  .description("Initialize the game")
  .requiredOption("-a, --admin <pubkey>", "Admin wallet")
  .requiredOption("-c, --config <json>", "Initialize Configuration JSON")
  .requiredOption("-m, --mint <pubkey>", "Mint Pubkey")
  .action(async (options) => {
    try {
      const { umi } = await initializePrereqs();

      const mint = publicKey(options.mint);

      const configFile = fs.readFileSync(options.config, "utf-8");
      const args: InitializeArgs = JSON.parse(configFile);

      // Validate the config
      // if (!config.creators || !Array.isArray(config.creators)) {
      //   throw new Error("Invalid config: creators array is required");
      // }

      // if (config.creators.length > config.max_num_creators) {
      //   throw new Error(
      //     `Number of creators (${config.creators.length}) exceeds max_num_creators (${config.max_num_creators})`
      //   );
      // }

      // Validate total shares
      // const totalShares = config.creators.reduce(
      //   (sum, creator) => sum + creator.share_in_bp,
      //   0
      // );
      // if (totalShares !== 10000) {
      //   throw new Error(
      //     `Total creator shares must equal 10000 basis points (100%). Current total: ${totalShares}`
      //   );
      // }

      // config.creators.map((creator) => {
      //   if (creator.claimed) {
      //     throw new Error("All creators must have claimed: false");
      //   }
      // });

      console.log("Initializing game with config:");
      console.log(args);

      const seed = generateRandomU64Seed();
      // const seed = BigInt(12958056478283855875);

      const [configState] = umi.eddsa.findPda(getSantaVsGrinchProgramId(umi), [
        string({ size: "variable" }).serialize("state"),
        publicKeySerializer().serialize(umi.payer.publicKey),
        u64().serialize(seed.valueOf()),
        publicKeySerializer().serialize(mint.toString()),
      ]);

      await initialize(umi, {
        admin: umi.payer,
        mint: mint,
        tokenProgram: SPL_TOKEN_PROGRAM_ID,
        args,
        seed: seed.valueOf(),
      }).sendAndConfirm(umi, options);

      console.log("✅ Done!", configState.toString());
    } catch (error) {
      console.error("Error:", error);
    }
  });

program
  .command("update-withdraw-unclaimed")
  .description("Update withdraw unclaimed timestamp")
  .requiredOption("-a, --admin <pubkey>", "Admin wallet")
  .requiredOption("-t, --timestamp <number>", "New timestamp")
  .action(async (options) => {
    try {
      console.log("Updating withdraw unclaimed timestamp...");
      // TODO: Implement update withdraw unclaimed instruction handler
    } catch (error) {
      console.error("Error:", error);
    }
  });

program
  .command("withdraw-creators")
  .description("Withdraw creators winnings")
  .requiredOption("-a, --admin <pubkey>", "Admin wallet")
  .action(async (options) => {
    try {
      console.log("Withdrawing creators winnings...");
      // TODO: Implement withdraw creators instruction handler
    } catch (error) {
      console.error("Error:", error);
    }
  });

program
  .command("withdraw-fees")
  .description("Withdraw fees")
  .requiredOption("-a, --admin <pubkey>", "Admin wallet")
  .action(async (options) => {
    try {
      console.log("Withdrawing fees...");
      // TODO: Implement withdraw fees instruction handler
    } catch (error) {
      console.error("Error:", error);
    }
  });

program
  .command("withdraw-unclaimed")
  .description("Withdraw unclaimed creators winnings")
  .requiredOption("-a, --admin <pubkey>", "Admin wallet")
  .action(async (options) => {
    try {
      console.log("Withdrawing unclaimed winnings...");
      // TODO: Implement withdraw unclaimed instruction handler
    } catch (error) {
      console.error("Error:", error);
    }
  });

// Parse command line arguments
program.parse(process.argv);
