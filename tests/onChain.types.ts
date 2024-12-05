import { SantaVsGrinch } from "../target/types/santa_vs_grinch";
import { IdlAccounts, IdlTypes } from "@coral-xyz/anchor";

export type ConfigType = IdlAccounts<SantaVsGrinch>["config"];
export type UserBetType = IdlTypes<SantaVsGrinch>["userBet"];
export type UserBetEnumType = IdlTypes<SantaVsGrinch>["bettingSide"];
