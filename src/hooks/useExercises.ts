import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { exerciseRepository } from "@/data";
import type { NewExercise } from "@/types/domain";

export const exercisesKey = ["exercises"] as const;

export const useExercises = () =>
  useQuery({
    queryKey: exercisesKey,
    queryFn: () => exerciseRepository.list(),
  });

export const useCreateExercise = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: NewExercise) => exerciseRepository.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: exercisesKey }),
  });
};

export const useDeleteExercise = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => exerciseRepository.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: exercisesKey }),
  });
};
