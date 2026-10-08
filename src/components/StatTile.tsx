interface StatTileProps {
  label: string;
  value: string;
  /** Secondary line under the value, e.g. the change versus an earlier period. */
  detail?: string;
}

/** Bordered tile showing one headline figure with its label. */
export function StatTile({ label, value, detail }: StatTileProps) {
  return (
    <div className="rounded-md border border-border bg-card min-w-0 p-3 md:p-5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-2 break-words text-xl font-semibold tabular md:text-2xl">{value}</p>
      {detail && <p className="mt-1 text-xs text-muted-foreground tabular">{detail}</p>}
    </div>
  );
}
