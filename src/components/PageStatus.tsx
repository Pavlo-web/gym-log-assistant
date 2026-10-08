import { Button } from "@/components/ui/button";

const STATUS = "py-12 text-center text-sm text-muted-foreground";

/** Shown in place of a page's content while its data loads. */
export function LoadingState({ label }: { label: string }) {
  return (
    <p role="status" className={STATUS}>
      {label}
    </p>
  );
}

interface ErrorStateProps {
  /** What failed, as a full sentence: "Could not load history." */
  message: string;
  onRetry: () => void;
}

/** Shown in place of a page's content when its data failed to load. */
export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div role="alert" className={STATUS}>
      {message}{" "}
      <Button variant="link" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}
