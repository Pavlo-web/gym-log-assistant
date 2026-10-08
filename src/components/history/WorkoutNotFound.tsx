import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

/** Shown when the workout id in the URL does not match a saved workout. */
export function WorkoutNotFound() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Workout not found</h1>
      <Button asChild variant="outline">
        <Link to="/history">Back to history</Link>
      </Button>
    </div>
  );
}
