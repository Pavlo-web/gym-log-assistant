import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { WorkoutSummary } from "@/components/workout/WorkoutSummary";
import { useExercises } from "@/hooks/useExercises";
import { useDeleteWorkout, useWorkout } from "@/hooks/useWorkouts";
import { epley1RM } from "@/lib/calc";
import { exerciseLabel, localWorkoutDate } from "./history-utils";

export function HistoryDetail({ workoutId }: { workoutId: string }) {
  const navigate = useNavigate();
  const { data: workout, isPending, isError } = useWorkout(workoutId);
  const exercises = useExercises();
  const remove = useDeleteWorkout();
  const [confirming, setConfirming] = useState(false);
  if (isPending || exercises.isPending) return <p role="status" className="py-12 text-muted-foreground">Loading workout…</p>;
  if (isError || exercises.isError) return <p role="alert" className="py-12 text-destructive">Could not load workout. Please try again.</p>;
  if (!workout) return <div className="space-y-4"><h1 className="text-2xl font-semibold">Workout not found</h1><Button asChild variant="outline"><Link to="/history">Back to history</Link></Button></div>;
  return <>
    <Button asChild variant="ghost" className="mb-5 -ml-3"><Link to="/history"><ArrowLeft /> Back to history</Link></Button>
    <div className="mb-6 grid min-w-0 grid-cols-1 items-start gap-4 md:flex md:flex-wrap md:justify-between"><div className="min-w-0 break-words"><h1 className="text-xl font-semibold md:text-2xl">{format(localWorkoutDate(workout.date), "EEEE, d MMMM yyyy")}</h1>{workout.notes && <p className="mt-2 text-sm text-muted-foreground">{workout.notes}</p>}</div><div className="grid grid-cols-2 gap-2 md:flex"><Button asChild variant="outline"><Link to="/history/$workoutId/edit" params={{ workoutId }}><Pencil /> Edit</Link></Button><Button variant="outline" className="text-destructive" onClick={() => setConfirming(true)}><Trash2 /> Delete</Button></div></div>
    <WorkoutSummary workout={workout} exerciseCount={workout.entries.length} />
    <div className="mt-6 space-y-4">{workout.entries.map((entry) => {
      const label = exerciseLabel(entry, exercises.data ?? []);
      const best = Math.max(0, ...entry.sets.map((set) => epley1RM(set.weight, set.reps)));
      return <section key={entry.id} className="rounded-md border border-border bg-card p-3 md:p-5"><h2 className="font-semibold">{label.name}</h2><p className="mb-4 text-xs text-muted-foreground">{label.group}</p><div className="overflow-x-auto"><table className="mobile-detail-table w-full text-sm tabular"><thead><tr className="border-b border-border text-left text-muted-foreground"><th className="pb-2 font-normal">#</th><th className="pb-2 font-normal">Weight (kg)</th><th className="pb-2 font-normal">Reps</th><th className="pb-2 text-right font-normal">Est. 1RM</th></tr></thead><tbody>{entry.sets.map((set, i) => {
        const estimate = epley1RM(set.weight, set.reps);
        return <tr key={set.id} className={estimate === best && best > 0 ? "border-t border-border bg-accent/40" : "border-t border-border"}><td className="py-2">{i + 1}</td><td data-label="Weight (kg)">{set.weight}</td><td data-label="Reps">{set.reps}</td><td data-label="Est. 1RM" className={estimate === best && best > 0 ? "text-right font-semibold text-primary" : "text-right"}>{estimate.toFixed(1)} kg</td></tr>;
      })}</tbody></table></div></section>;
    })}</div>
    <AlertDialog open={confirming} onOpenChange={setConfirming}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete workout?</AlertDialogTitle><AlertDialogDescription>This workout and its sets will be permanently removed.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={remove.isPending} onClick={(event) => { event.preventDefault(); void remove.mutateAsync(workoutId).then(async () => { toast.success("Workout deleted"); await navigate({ to: "/history" }); }).catch(() => toast.error("Could not delete workout")); }}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </>;
}