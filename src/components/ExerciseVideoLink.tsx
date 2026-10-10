import { Hint } from "@/components/Hint";
import { CirclePlay } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exerciseVideoUrl } from "@/lib/workout";

export function ExerciseVideoLink({ name }: { name: string }) {
  return (
    <Hint label="Watch how to do it">
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
        >
          <CirclePlay />
        </a>
      </Button>
    </Hint>
  );
}
