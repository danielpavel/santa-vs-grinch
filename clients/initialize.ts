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

async function initializeGame(umi: Umi) {
  const fee_bp = 100;
  const creators: Array<Creator> = [
    {
      pubkey: publicKey("5GY5g8w1x1NZYkehip6nSG3FHdBgvhGnUJVNoK9zVGKs"),
      shareInBp: 3333,
    },
    {
      pubkey: publicKey("5GY5g8w1x1NZYkehip6nSG3FHdBgvhGnUJVNoK9zVGKs"),
      shareInBp: 3333,
    },
    {
      pubkey: publicKey("5GY5g8w1x1NZYkehip6nSG3FHdBgvhGnUJVNoK9zVGKs"),
      shareInBp: 3334,
    },
  ];

  await initialize(umi, {
    admin: umi.payer,
    creators,
    maxNumCreators: creators.length,
    adminFeePercentageBp: fee_bp,
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

  let config = await getConfig(umi);
  console.log("config first", config);

  // await placeBet(umi, BigInt(1 * LAMPORTS_PER_SOL), "santa");
  //
  // console.log("Sleeeping ...");
  // await new Promise((h) => setTimeout(h, 2000));
  //
  // config = await getConfig(umi);
  // console.log("config", config);
};

main()
  .then(() => {
    console.log("✅ Done!");
  })
  .catch((err) => {
    console.log("❌ Failed with:", err);
  });
