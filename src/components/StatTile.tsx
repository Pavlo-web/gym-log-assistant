import { Surface } from "@/components/Surface";
import { useCountUp } from "@/hooks/useCountUp";

/** A figure that counts up from zero; `format` turns each step into the shown text. */
export interface CountedValue {
  amount: number;
  format: (amount: number) => string;
}

interface StatTileProps {
  label: string;
  /** Fixed text, or a number that counts up when the tile appears. */
  value: string | CountedValue;
  /** Secondary line under the value, e.g. the change versus an earlier period. */
  detail?: string;
  /** Small print at the bottom, e.g. the date a record was set. */
  footnote?: string;
}

function CountUp({ amount, format }: CountedValue) {
  return <>{format(useCountUp(amount))}</>;
}

/** Bordered tile showing one headline figure with its label. */
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
