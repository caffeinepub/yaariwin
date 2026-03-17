import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { NumberBet, UserProfile } from "../backend.d";
import { useActor } from "./useActor";

export function useCurrentRound() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["currentRound"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCurrentRound();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000,
  });
}

export function useAllRounds() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["allRounds"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllRounds();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMyBets(roundId: bigint | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["myBets", roundId?.toString()],
    queryFn: async () => {
      if (!actor || roundId === undefined) return [];
      return actor.getMyBets(roundId);
    },
    enabled: !!actor && !isFetching && roundId !== undefined,
  });
}

export function useAllBetsForRound(roundId: bigint | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["allBets", roundId?.toString()],
    queryFn: async () => {
      if (!actor || roundId === undefined) return [];
      return actor.getAllBetsForRound(roundId);
    },
    enabled: !!actor && !isFetching && roundId !== undefined,
    refetchInterval: 8000,
  });
}

export function useRoundResult(roundId: bigint | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["roundResult", roundId?.toString()],
    queryFn: async () => {
      if (!actor || roundId === undefined) return null;
      return actor.getRoundResult(roundId);
    },
    enabled: !!actor && !isFetching && roundId !== undefined,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePlaceBets() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      roundId,
      bets,
    }: { roundId: bigint; bets: NumberBet[] }) => {
      if (!actor) throw new Error("Not connected");
      return actor.placeBets(roundId, bets);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myBets"] });
      qc.invalidateQueries({ queryKey: ["allBets"] });
    },
  });
}

export function useCreateRound() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (roundName: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.createRound(roundName);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["currentRound"] });
      qc.invalidateQueries({ queryKey: ["allRounds"] });
    },
  });
}

export function useCloseRound() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (roundId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.closeRound(roundId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["currentRound"] });
      qc.invalidateQueries({ queryKey: ["allRounds"] });
    },
  });
}

export function useDeclareWinner() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      roundId,
      winningNumber,
    }: { roundId: bigint; winningNumber: bigint }) => {
      if (!actor) throw new Error("Not connected");
      return actor.declareWinner(roundId, winningNumber);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["currentRound"] });
      qc.invalidateQueries({ queryKey: ["allRounds"] });
      qc.invalidateQueries({ queryKey: ["roundResult"] });
    },
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Not connected");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}
