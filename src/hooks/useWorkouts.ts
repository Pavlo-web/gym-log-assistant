import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { workoutRepository } from "@/data";
import type { NewWorkout } from "@/types/domain";

export const workoutsKey = ["workouts"] as const;

export const useWorkouts = () =>
  useQuery({
    queryKey: workoutsKey,
    queryFn: () => workoutRepository.list(),
  });

export const useWorkout = (id: string | undefined) =>
  useQuery({
    queryKey: [...workoutsKey, id],
    queryFn: () => (id ? workoutRepository.getById(id) : Promise.resolve(null)),
    enabled: !!id,
  });

export const useCreateWorkout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: NewWorkout) => workoutRepository.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: workoutsKey }),
  });
};

export const useUpdateWorkout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<NewWorkout> }) =>
      workoutRepository.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: workoutsKey }),
  });
};

export const useDeleteWorkout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => workoutRepository.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: workoutsKey }),
  });
};
