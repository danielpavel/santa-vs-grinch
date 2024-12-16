import { clusterApiUrl, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { getKeypairFromFile } from "@solana-developers/helpers";
import {
  bet,
  fetchConfig,
  getSantaVsGrinchProgramId,
  initialize,
} from "./generated/umi/src";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  keypairIdentity,
  publicKey,
  TransactionBuilderSendAndConfirmOptions,
  Umi,
} from "@metaplex-foundation/umi";
import { Creator } from "./generated/umi/src";
import path from "path";
import {
  publicKey as publicKeySerializer,
  string,
} from "@metaplex-foundation/umi/serializers";
import { readFileSync } from "fs";

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

async function getConfig(umi: Umi) {
  const [configStatePubkey] = umi.eddsa.findPda(
    getSantaVsGrinchProgramId(umi),
    [
      string({ size: "variable" }).serialize("state"),
      publicKeySerializer().serialize(umi.payer),
    ]
  );

  const configStateAccount = await fetchConfig(umi, configStatePubkey);

  return configStateAccount;
}

async function initializeGame(umi: Umi, configFname: string) {
  console.log("Initializing game...");

  const configPath = path.join(process.cwd(), configFname);

  // Read and parse the config file
  const configFile = readFileSync(configPath, "utf-8");
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
  console.log("Admin:");
  console.log("Admin Fee:", config.admin_fee_percentage_bp, "basis points");
  console.log("Max Creators:", config.max_num_creators);
  console.log("Creators:", creators);

  // await initialize(umi, {
  //   admin: umi.payer,
  //   creators,
  //   maxNumCreators: creators.length,
  //   adminFeePercentageBp: parseInt(options.fee),
  // }).sendAndConfirm(umi, options);

  await initialize(umi, {
    admin: umi.payer,
    creators,
    maxNumCreators: config.max_num_creators,
    adminFeePercentageBp: config.admin_fee_percentage_bp,
  }).sendAndConfirm(umi, options);
}

async function placeBet(umi: Umi, amount: BigInt, side: "santa" | "grinch") {
  const program = getSantaVsGrinchProgramId(umi);
  const [configStatePubkey] = umi.eddsa.findPda(program, [
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
    string({ size: "variable" }).serialize("santa"),
  ]);

  await bet(umi, {
    user: umi.payer,
    state: configStatePubkey,
    feesVault: feesVaultPubkey,
    userBet: userBetPubkey,
    amount: amount.valueOf(),
    betTag: side,
  }).sendAndConfirm(umi, options);
}

// I don't have time to watch over the client now - I will default to vanilla js and update later if needed.
const main = async () => {
  const umi = createUmi(clusterApiUrl("devnet"), { commitment: "confirmed" });
  const keypairPath = path.join(process.cwd(), "keypair.json");
  const kp = await getKeypairFromFile(keypairPath);
  const admin = umi.eddsa.createKeypairFromSecretKey(kp.secretKey);

  umi.use(keypairIdentity(admin));

  // await initializeGame(umi, "cli/initialize_config.json");

  const c = await getConfig(umi);
  console.log(c);
};

main()
  .then(() => {
    console.log("✅ Done!");
  })
  .catch((err) => {
    console.log("❌ Failed with:", err);
  });
