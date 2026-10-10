import { Hint } from "@/components/Hint";
import { SectionTitle } from "@/components/SectionTitle";
import { Trash2 } from "lucide-react";
import { ExerciseVideoLink } from "@/components/ExerciseVideoLink";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Exercise, MuscleGroup } from "@/types/domain";

export interface ExerciseGroup {
  muscleGroup: MuscleGroup;
  items: Exercise[];
}

interface ExerciseGroupListProps {
  groups: ExerciseGroup[];
  /** Called for custom exercises only; default exercises cannot be deleted. */
  onDelete: (exercise: Exercise) => void;
}

/** The exercise library, one section per muscle group. */
export function ExerciseGroupList({ groups, onDelete }: ExerciseGroupListProps) {
  return (
    <div className="space-y-9">
      {groups.map(({ muscleGroup, items }) => (
        <section key={muscleGroup} aria-label={muscleGroup}>
          <SectionTitle
            title={muscleGroup}
            className="mb-3 items-baseline border-b border-border pb-3"
            action={
              <span className="tabular text-xs text-muted-foreground">
                {items.length} {items.length === 1 ? "exercise" : "exercises"}
              </span>
            }
          />
          <ul className="divide-y divide-border">
            {items.map((exercise) => (
              <li
                key={exercise.id}
                className="flex min-h-12 items-center justify-between gap-3 py-2 pl-1"
              >
                <span className="min-w-0 text-sm">{exercise.name}</span>
                <span className="flex shrink-0 items-center gap-1">
                  {exercise.isCustom && (
                    <Badge variant="secondary" className="mr-1 font-normal">
                      Custom
                    </Badge>
                  )}
                  <ExerciseVideoLink name={exercise.name} />
                  {exercise.isCustom && (
                    <Hint label="Delete exercise">
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label={`Delete ${exercise.name}`}
                        onClick={() => onDelete(exercise)}
                        className="text-muted-foreground hover:text-danger"
                      >
                        <Trash2 />
                      </Button>
                    </Hint>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
