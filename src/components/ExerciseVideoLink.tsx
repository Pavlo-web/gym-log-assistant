import { CirclePlay } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exerciseVideoUrl } from "@/lib/workout";

/** Icon link that opens videos showing how to perform the exercise, in a new tab. */
export function ExerciseVideoLink({ name }: { name: string }) {
  return (
    <Button
      asChild
      size="icon"
      variant="ghost"
      className="text-muted-foreground hover:text-foreground"
    >
      <a
        href={exerciseVideoUrl(name)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Watch how to do ${name} (opens YouTube)`}
        title="Watch how to do it"
      >
        <CirclePlay />
      </a>
    </Button>
  );
}
