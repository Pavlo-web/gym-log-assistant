import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { demoDataRepository } from "@/data";

export const demoDataKey = ["demo-data"] as const;

/** Whether sample records are currently stored. */
export function useHasDemoData() {
  return useQuery({
    queryKey: demoDataKey,
    queryFn: () => demoDataRepository.has(),
  });
}

/** Sample data touches workouts, body weight and plans, so every list is reloaded. */
export function useLoadDemoData() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => demoDataRepository.load(),
    onSuccess: () => queryClient.invalidateQueries(),
  });
}

export function useRemoveDemoData() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => demoDataRepository.remove(),
    onSuccess: () => queryClient.invalidateQueries(),
  });
}
