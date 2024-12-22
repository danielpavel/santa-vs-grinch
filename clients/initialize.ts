import {
  clusterApiUrl,
  LAMPORTS_PER_SOL,
  PublicKey as Web3PublicKey,
} from "@solana/web3.js";
import { getKeypairFromFile } from "@solana-developers/helpers";
import {
  bet,
  fetchConfig,
  getSantaVsGrinchProgramId,
  initialize,
  InitializeArgs,
} from "./generated/umi/src";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  generateSigner,
  keypairIdentity,
  percentAmount,
  PublicKey,
  publicKey,
  some,
  TransactionBuilderSendAndConfirmOptions,
  Umi,
} from "@metaplex-foundation/umi";
import { Creator } from "./generated/umi/src";
import path from "path";
import {
  publicKey as publicKeySerializer,
  string,
  u64,
} from "@metaplex-foundation/umi/serializers";
import { readFileSync } from "fs";
import {
  createFungible,
  mintV1,
  mplTokenMetadata,
  TokenStandard,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  fromWeb3JsPublicKey,
  toWeb3JsPublicKey,
} from "@metaplex-foundation/umi-web3js-adapters";
import { create } from "domain";
import { fetchMint } from "@metaplex-foundation/mpl-toolbox";

const options: TransactionBuilderSendAndConfirmOptions = {
  confirm: { commitment: "confirmed" },
};

async function getConfig(umi: Umi, mint: PublicKey, seed: bigint) {
  const [configState, configStateBump] = umi.eddsa.findPda(
    getSantaVsGrinchProgramId(umi),
    [
      string({ size: "variable" }).serialize("state"),
      publicKeySerializer().serialize(umi.payer.publicKey),
      u64().serialize(seed.valueOf()),
      publicKeySerializer().serialize(mint.toString()),
    ]
  );

  const configStateAccount = await fetchConfig(umi, configState);

  return configStateAccount;
}

export async function createSplMint(umi: Umi, options) {
  try {
    const mint = generateSigner(umi);

    const txResult = await createFungible(umi, {
      mint,
      name: "Santa-vs-Grinch Token",
      uri: "https://arweave.net/123",
      sellerFeeBasisPoints: percentAmount(5.5),
      decimals: some(6),
    }).sendAndConfirm(umi, options);

    return publicKey(mint.publicKey);
  } catch (error) {
    console.error("Error creating mint:", error);
    throw error;
  }
}

export async function mintSplMint(
  umi: Umi,
  mint: PublicKey,
  owner: PublicKey,
  amount: bigint,
  options
) {
  try {
    const ata = getAssociatedTokenAddressSync(
      toWeb3JsPublicKey(mint),
      toWeb3JsPublicKey(owner)
    );

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

async function initializeGame(umi: Umi, mint: PublicKey, configFname: string) {
  console.log("Initializing game...");

  const configPath = path.join(process.cwd(), configFname);

  // Read and parse the config file
  const configFile = readFileSync(configPath, "utf-8");
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

  // args.creators.map((creator) => {
  //   if (creator.claimed) {
  //     throw new Error("All creators must have claimed: false");
  //   }
  // });

  console.log("Initializing game with config:");
  console.log(args);

  // const seed = generateRandomU64Seed();
  const seed = BigInt(12958056478283855875);

  const [configState, configStateBump] = umi.eddsa.findPda(
    getSantaVsGrinchProgramId(umi),
    [
      string({ size: "variable" }).serialize("state"),
      publicKeySerializer().serialize(umi.payer.publicKey),
      u64().serialize(seed.valueOf()),
      publicKeySerializer().serialize(mint.toString()),
    ]
  );

  await initialize(umi, {
    admin: umi.payer,
    mint: mint,
    tokenProgram: fromWeb3JsPublicKey(TOKEN_PROGRAM_ID),
    args,
    seed: seed.valueOf(),
  }).sendAndConfirm(umi, options);

  console.log("✅ Done!", configState.toString());
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
  umi.use(mplTokenMetadata());

  const mint = publicKey("5bEjR2Taido5JNM4v45yK8f93PvHNnwwWP5GvtnTD637");

  const seed = BigInt(12958056478283855875);
  const configStatePubkey = publicKey(
    "HngYKFTCaAdX9MxY9pMpZKyQ3WWP7EpBPzMBZaUVogb3"
  );

  console.log("mint:", await fetchMint(umi, mint));

  // const mint = await createSplMint(umi, options);
  // console.log("✅ Mint created!", mint.toString());
  //
  // const users = [
  //   publicKey("5GY5g8w1x1NZYkehip6nSG3FHdBgvhGnUJVNoK9zVGKs"),
  //   publicKey("8FYZEp3xorQoLe3ngQuGA4B44EXF3j5oUPApJg7GWX7K"),
  //   publicKey("9j3uYxDQdgZxncwHrtroGPwo9qw9RhbBJpnhcbkNsafT"),
  // ];
  //
  // const usersAtas = await Promise.all(
  //   users.map(async (u) => {
  //     return await mintSplMint(
  //       umi,
  //       mint,
  //       u,
  //       BigInt(10_000_000 * 10 ** 6),
  //       options
  //     );
  //   })
  // );
  // console.log(usersAtas.map((u) => u.toString()));

  await initializeGame(umi, mint, "cli/initialize_config.json");

  // const c = await getConfig(umi, mint, seed);
  // console.log(c);
};

main()
  .then(() => {
    console.log("✅ Done!");
  })
  .catch((err) => {
    console.log("❌ Failed with:", err);
  });
