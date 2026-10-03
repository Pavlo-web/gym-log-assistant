import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { draftRepository } from "@/data";
import type { WorkoutDraft } from "@/types/domain";

export const draftKey = ["workout-draft"] as const;

export function useWorkoutDraft() {
  return useQuery({ queryKey: draftKey, queryFn: () => draftRepository.get(), staleTime: Infinity });
}

export function useSaveWorkoutDraft() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (draft: WorkoutDraft) => draftRepository.set(draft),
    onSuccess: (_r, draft) => queryClient.setQueryData(draftKey, draft),
  });
}

export function useClearWorkoutDraft() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => draftRepository.clear(),
    onSuccess: () => queryClient.setQueryData(draftKey, null),
  });
}
