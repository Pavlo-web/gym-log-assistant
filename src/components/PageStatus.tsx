import { Button } from "@/components/ui/button";

const STATUS = "py-12 text-center text-sm text-muted-foreground";

export function LoadingState({ label }: { label: string }) {
  return (
    <p role="status" className={STATUS}>
      {label}
    </p>
  );
}

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

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
