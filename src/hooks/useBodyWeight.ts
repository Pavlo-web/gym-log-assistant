import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { bodyWeightRepository } from "@/data";

export const bodyWeightKey = ["body-weight"] as const;

export const useBodyWeight = () =>
  useQuery({
    queryKey: bodyWeightKey,
    queryFn: () => bodyWeightRepository.list(),
  });

export const useSaveBodyWeight = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ date, weight }: { date: string; weight: number }) =>
      bodyWeightRepository.save(date, weight),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: bodyWeightKey }),
  });
};

export const useDeleteBodyWeight = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bodyWeightRepository.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: bodyWeightKey }),
  });
};
