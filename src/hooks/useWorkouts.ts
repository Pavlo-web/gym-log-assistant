import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { workoutRepository } from "@/data/local-storage-repositories";
import type { NewWorkout } from "@/types/domain";

export const workoutsKey = ["workouts"] as const;

export function useWorkouts() {
  return useQuery({
    queryKey: workoutsKey,
    queryFn: () => workoutRepository.list(),
  });
}

export function useWorkout(id: string | undefined) {
  return useQuery({
    queryKey: [...workoutsKey, id],
    queryFn: () => workoutRepository.getById(id!),
    enabled: !!id,
  });
}

export function useCreateWorkout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: NewWorkout) => workoutRepository.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: workoutsKey }),
  });
}

export function useUpdateWorkout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<NewWorkout> }) =>
      workoutRepository.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: workoutsKey }),
  });
}

export function useDeleteWorkout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => workoutRepository.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: workoutsKey }),
  });
}
