import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { demoDataRepository } from "@/data";

export const demoDataKey = ["demo-data"] as const;

export const useHasDemoData = () =>
  useQuery({
    queryKey: demoDataKey,
    queryFn: () => demoDataRepository.has(),
  });

/** Sample data touches workouts, body weight and plans, so every list is reloaded. */
export const useLoadDemoData = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => demoDataRepository.load(),
    onSuccess: () => queryClient.invalidateQueries(),
  });
};

export const useRemoveDemoData = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => demoDataRepository.remove(),
    onSuccess: () => queryClient.invalidateQueries(),
  });
};
