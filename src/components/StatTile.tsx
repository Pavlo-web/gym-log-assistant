import { Surface } from "@/components/Surface";
import { useCountUp } from "@/hooks/useCountUp";

export interface CountedValue {
  amount: number;
  format: (amount: number) => string;
}

interface StatTileProps {
  label: string;
  value: string | CountedValue;
  detail?: string;
  footnote?: string;
}

function CountUp({ amount, format }: CountedValue) {
  return <>{format(useCountUp(amount))}</>;
}

export function StatTile({ label, value, detail, footnote }: StatTileProps) {
  return (
    <Surface>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-2 break-words text-xl font-semibold tabular md:text-2xl">
        {typeof value === "string" ? value : <CountUp {...value} />}
      </p>
      {detail && <p className="mt-1 text-xs text-muted-foreground tabular">{detail}</p>}
      {footnote && <p className="mt-2 text-xs text-muted-foreground">{footnote}</p>}
    </Surface>
  );
}
