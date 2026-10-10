import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { plannedWorkoutRepository } from "@/data";
import type { NewPlannedWorkout } from "@/types/domain";

export const plannedWorkoutsKey = ["planned-workouts"] as const;

export const usePlannedWorkouts = () =>
  useQuery({
    queryKey: plannedWorkoutsKey,
    queryFn: () => plannedWorkoutRepository.list(),
  });

export const useCreatePlannedWorkout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: NewPlannedWorkout) => plannedWorkoutRepository.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: plannedWorkoutsKey }),
  });
};

export const useDeletePlannedWorkout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => plannedWorkoutRepository.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: plannedWorkoutsKey }),
  });
};
