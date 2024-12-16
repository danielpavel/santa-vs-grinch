import { Command } from "commander";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import path from "path";
import { getKeypairFromFile } from "@solana-developers/helpers";
import {
  createSignerFromKeypair,
  keypairIdentity,
  publicKey,
  TransactionBuilderSendAndConfirmOptions,
} from "@metaplex-foundation/umi";
import fs from "fs";

import {
  publicKey as publicKeySerializer,
  string,
} from "@metaplex-foundation/umi/serializers";
import {
  bet,
  buyMysteryBox,
  fetchConfig,
  fetchUserBet,
  getSantaVsGrinchProgram,
  getSantaVsGrinchProgramId,
  initialize,
} from "../clients/generated/umi/src";

interface CreatorConfig {
  pubkey: string;
  share_in_bp: number;
  claimed: boolean;
}

interface InitializeConfig {
  admin_fee_percentage_bp: number;
  max_num_creators: number;
  creators: CreatorConfig[];
}

const options: TransactionBuilderSendAndConfirmOptions = {
  confirm: { commitment: "confirmed" },
};

// Initialize Commander
const program = new Command();

// Configure CLI metadata
program
  .name("santa-vs-grinch-cli")
  .description("CLI to interact with Santa vs Grinch Solana program")
  .version("0.1.0");

// Utility Functions
const initializePrereqs = async () => {
  const umi = createUmi(clusterApiUrl("devnet"), { commitment: "confirmed" });

  const keypairPath = path.join(process.cwd(), "keypair.json");
  const kp = await getKeypairFromFile(keypairPath);
  const admin = umi.eddsa.createKeypairFromSecretKey(kp.secretKey);

  umi.use(keypairIdentity(admin));

  return { umi, programId: getSantaVsGrinchProgramId(umi) };
};

// State Monitoring Commands
program
  .command("get-state")
  .description("Get the current state of the game")
  .requiredOption("-a, --admin <pubkey>", "Admin public key")
  .action(async (options) => {
    try {
      const { umi, programId } = await initializePrereqs();

      const [configStatePubkey] = umi.eddsa.findPda(programId, [
        string({ size: "variable" }).serialize("state"),
        publicKeySerializer().serialize(publicKey(options.admin)),
      ]);

      console.log("Fetching state...");

      const configStateAccount = await fetchConfig(umi, configStatePubkey);

      console.log(configStateAccount);
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

// Instruction Commands
program
  .command("bet")
  .description("Place a bet")
  .requiredOption("-k, --keypair <keypair>", "User Keypair")
  .requiredOption("-a, --amount <number>", "Bet amount in lamports")
  .requiredOption("-t, --tag <string>", "Bet tag (santa/grinch).")
  .action(async (options) => {
    try {
      const { umi, programId } = await initializePrereqs();
      const tag = options.tag;
      const amount = options.amount;

      if (tag != "grinch" && tag != "santa") {
        throw new Error(`Invalid ${tag} tag. Should be "santa" | "grinch"`);
      }

      const [configStatePubkey] = umi.eddsa.findPda(programId, [
        string({ size: "variable" }).serialize("state"),
        publicKeySerializer().serialize(umi.payer),
      ]);

      const [feesVaultPubkey] = umi.eddsa.findPda(program, [
        string({ size: "variable" }).serialize("vault"),
        publicKeySerializer().serialize(configStatePubkey),
        string({ size: "variable" }).serialize("fees"),
      ]);

      const [userBetPubkey] = umi.eddsa.findPda(program, [
        string({ size: "variable" }).serialize("user"),
        publicKeySerializer().serialize(umi.payer),
        string({ size: "variable" }).serialize(tag),
      ]);

      const userKeypairPath = path.join(process.cwd(), options.keypair);
      const userKp = await getKeypairFromFile(userKeypairPath);
      const userSigner = createSignerFromKeypair(
        umi,
        umi.eddsa.createKeypairFromSecretKey(userKp.secretKey)
      );

      console.log("Placing bet...");

      await bet(umi, {
        user: userSigner,
        state: configStatePubkey,
        feesVault: feesVaultPubkey,
        userBet: userBetPubkey,
        amount: parseInt(amount),
        betTag: tag,
      }).sendAndConfirm(umi, options);

      console.log("✅ Done!");
    } catch (error) {
      console.error("Error:", error);
    }
  });

program
  .command("buy-mystery-box")
  .description("Buy a mystery box")
  .requiredOption("-k, --keypair <keypair.json>", "User wallet")
  .requiredOption("-t, --tag <string>", "Bet tag")
  .action(async (options) => {
    try {
      const { umi, programId } = await initializePrereqs();
      const tag = options.tag;

      if (tag != "grinch" && tag != "santa") {
        throw new Error(`Invalid ${tag} tag. Should be "santa" | "grinch"`);
      }

      const [configStatePubkey] = umi.eddsa.findPda(programId, [
        string({ size: "variable" }).serialize("state"),
        publicKeySerializer().serialize(umi.payer),
      ]);

      const [feesVaultPubkey] = umi.eddsa.findPda(program, [
        string({ size: "variable" }).serialize("vault"),
        publicKeySerializer().serialize(configStatePubkey),
        string({ size: "variable" }).serialize("fees"),
      ]);

      const [userBetPubkey] = umi.eddsa.findPda(program, [
        string({ size: "variable" }).serialize("user"),
        publicKeySerializer().serialize(umi.payer),
        string({ size: "variable" }).serialize(tag),
      ]);

      const userKeypairPath = path.join(process.cwd(), options.keypair);
      const userKp = await getKeypairFromFile(userKeypairPath);
      const userSigner = createSignerFromKeypair(
        umi,
        umi.eddsa.createKeypairFromSecretKey(userKp.secretKey)
      );

      console.log("Buying mystery box...");

      await buyMysteryBox(umi, {
        user: userSigner,
        state: configStatePubkey,
        feesVault: feesVaultPubkey,
        userBet: userBetPubkey,
        betTag: tag,
      }).sendAndConfirm(umi, options);
    } catch (error) {
      console.error("Error:", error);
    }
  });

program
  .command("claim-winnings")
  .description("Claim winnings")
  .requiredOption("-u, --user <pubkey>", "User wallet")
  .requiredOption("-t, --tag <string>", "Bet tag")
  .action(async (options) => {
    try {
      console.log("Claiming winnings...");
      // TODO: Implement claim winnings instruction handler
    } catch (error) {
      console.error("Error:", error);
    }
  });

program
  .command("end-game")
  .description("End the game")
  .requiredOption("-a, --admin <pubkey>", "Admin wallet")
  .action(async (options) => {
    try {
      console.log("Ending game...");
      // TODO: Implement end game instruction handler
    } catch (error) {
      console.error("Error:", error);
    }
  });

program
  .command("initialize")
  .description("Initialize the game")
  .requiredOption("-a, --admin <pubkey>", "Admin wallet")
  .requiredOption("-c, --creators <json>", "Creators configuration JSON")
  .requiredOption("-m, --max-creators <number>", "Maximum number of creators")
  .requiredOption("-f, --fee <number>", "Admin fee percentage in basis points")
  .action(async (options) => {
    try {
      const { umi, programId } = await initializePrereqs();

      // Read and parse the config file
      const configFile = fs.readFileSync(options.config, "utf-8");
      const config: InitializeConfig = JSON.parse(configFile);

      // Validate the config
      if (!config.creators || !Array.isArray(config.creators)) {
        throw new Error("Invalid config: creators array is required");
      }

      if (config.creators.length > config.max_num_creators) {
        throw new Error(
          `Number of creators (${config.creators.length}) exceeds max_num_creators (${config.max_num_creators})`
        );
      }

      // Validate total shares
      const totalShares = config.creators.reduce(
        (sum, creator) => sum + creator.share_in_bp,
        0
      );
      if (totalShares !== 10000) {
        throw new Error(
          `Total creator shares must equal 10000 basis points (100%). Current total: ${totalShares}`
        );
      }

      config.creators.map((creator) => {
        if (creator.claimed) {
          throw new Error("All creators must have claimed: false");
        }
      });

      // Convert creator pubkeys to PublicKey objects
      const creators = config.creators.map((creator) => ({
        pubkey: publicKey(creator.pubkey),
        shareInBp: creator.share_in_bp,
        claimed: creator.claimed,
      }));

      console.log("Initializing game with config:");
      console.log("Admin:", options.admin);
      console.log("Admin Fee:", config.admin_fee_percentage_bp, "basis points");
      console.log("Max Creators:", config.max_num_creators);
      console.log("Creators:", creators);

      await initialize(umi, {
        admin: umi.payer,
        creators,
        maxNumCreators: creators.length,
        adminFeePercentageBp: parseInt(options.fee),
      }).sendAndConfirm(umi, options);
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
