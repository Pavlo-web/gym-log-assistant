import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { exerciseRepository } from "@/data/local-storage-repositories";
import type { NewExercise } from "@/types/domain";

export const exercisesKey = ["exercises"] as const;

export function useExercises() {
  return useQuery({
    queryKey: exercisesKey,
    queryFn: () => exerciseRepository.list(),
  });
}

export function useCreateExercise() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: NewExercise) => exerciseRepository.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: exercisesKey }),
  });
}

export function useDeleteExercise() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => exerciseRepository.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: exercisesKey }),
  });
}
