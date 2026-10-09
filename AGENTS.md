<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

See `README.md` for the project overview, structure and architecture. The rules
below are the conventions to keep when changing code.

## Structure

- Render the shared application shell in the root route so leaf pages contain only their own content.
- Keep route files thin: page metadata via `pageMeta()` plus one page component from `src/components/<page>/`.
- One component per file. Split a component when it grows past one clear responsibility.
- Define navigation items once in `src/components/navigation.ts`; the sidebar and the phone bottom bar are both derived from it.
- Use the shared `ConfirmDialog` for destructive confirmations, `EmptyState` for empty pages, `PageHeader` for page titles, and `LoadingState` / `ErrorState` (with a retry) while a page loads or fails.

## Data

- Import repositories through `@/data` exclusively so the storage implementation can be exchanged in one place.
- Persist exercise and workout data locally through repository interfaces because this stage has no backend.
- Components read and change data only through the hooks in `src/hooks`; they never touch `localStorage`.
- Store exercise labels on workout entries when saving and prefer live library labels when displaying (`exerciseLabel()` in `src/lib/workout.ts`); historical workouts remain readable after exercise deletion.
- Body weight has one entry per day: saving a day that exists replaces it.
- Read and write storage only through `src/data/storage.ts`. Give every stored type a zod schema in `src/data/schemas.ts` and pass it to `readList` / `readObject`.
- Use `writeList` / `writeItem` for anything the user asked to save, so a failure reaches the UI as `StorageWriteError`; use the `tryWrite…` variants only for housekeeping done while reading.
- A planned workout (`PlannedWorkout`) is not a workout: it has no sets and must never be counted in statistics, records or the calendar. Do not allow future dates in the log itself.
- Sample records get an id starting with `demo-` (`src/data/demo-data.ts`). Removing demo data deletes by that prefix only, so never give a user-created record such an id.
- Do not rename the `gymlog.v1.*` storage keys. To drop a default exercise, add it to `REMOVED_DEFAULT_EXERCISES` and bump the migration key.

## Logic

- Put pure logic in `src/lib`. Nothing in `src/lib` may import from `src/components`.
- Parse user-typed numbers only with `parseDecimal` / `parseInteger` (`src/lib/number.ts`); both comma and dot are decimal separators.
- Treat workout dates as local `yyyy-MM-dd` strings and go through `src/lib/date.ts`; never use `new Date(string)` or `toISOString()` on them.
- Take validation limits from `src/lib/limits.ts` instead of repeating the numbers.
- Compute volume and set counts with the helpers in `src/lib/calc.ts`.

## UI

- Keep phone navigation in a dedicated shell component and share safe-area offsets with sticky form actions so navigation and save controls never overlap.
- Desktop (768px and up) and phone layouts come from the same components: use Tailwind `md:` classes and the `mobile-*` rules in `src/styles.css`, not separate components or user-agent checks.
- Use the semantic color tokens from `src/styles.css`; no hard-coded colors. Error text and invalid borders use `danger`; `destructive` is only for filled delete buttons.
- Show a problem with one field under that field with `FieldError` and mark only that input `aria-invalid`. Use `FormAlert` for a problem with the form as a whole, such as a failed save. No browser validation bubbles: forms set `noValidate`.
- Number fields go through `NumberInput`, which drops letters and extra separators; give each a `maxLength` from `src/lib/limits.ts`.
- Animate only through `useCountUp` (figures, via the `value` object of `StatTile`) and `SERIES_ANIMATION` (charts); both honour `useReducedMotion`.
- `NumberInput` steppers: use `stepperLayout="sides"` where the field has the full row on phones; keep the default inside table cells.

## Before finishing

Run type check (`bunx tsc --noEmit`), `bun run lint` and `bun run build`; all must pass. The project has no automated tests, so check changed pages in the browser at desktop and phone widths.
