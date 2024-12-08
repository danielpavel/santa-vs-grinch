"use client";

import {
  SANTA_VS_GRINCH_PROGRAM_ID as programId,
  getSantaVsGrinchProgram,
} from "anchor";
import { useConnection } from "@solana/wallet-adapter-react";
import { useMutation, useQuery } from "@tanstack/react-query";

import toast from "react-hot-toast";
import { useCluster } from "../cluster/cluster-data-access";
import { useAnchorProvider } from "../solana/solana-provider";
import { useTransactionToast } from "../ui/ui-layout";

export function useSantaVsGrinchProgram() {
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const program = getSantaVsGrinchProgram(provider);

  const getProgramAccount = useQuery({
    queryKey: ["get-program-account", { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  const greet = useMutation({
    mutationKey: ["basic", "greet", { cluster }],
    mutationFn: async () => "", //TODO: This is where you call the program!
    onSuccess: (signature) => {
      transactionToast(signature);
    },
    onError: () => toast.error("Failed to run program"),
  });

  return {
    program,
    programId,
    getProgramAccount,
    greet,
  };
}
