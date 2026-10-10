Design-system pass. Goal: one consistent, more modern visual system across the whole app. No new features, no changes to data, routes, storage or UI text (except where stated). Follow AGENTS.md conventions. Do the parts in this order; part 1 is the most important.

1. TIME PICKER (new component, replaces the only native control left)
In src/components/workout/PlanWorkoutDialog.tsx the Time field is a native <input type="time">: its icon sits next to the text instead of at the right edge, and it opens the browser's own grey/blue popup, which clashes with our DatePicker.
Create src/components/ui/time-picker.tsx as the sibling of date-picker.tsx:
- Props: value ("HH:mm" 24h string), onChange, id, optional minuteStep (default 5), aria-invalid support.
- Trigger: the exact same trigger as DatePicker (extract the shared trigger into one small internal component, e.g. PickerTrigger, used by both so they can never drift): same height, border, background, font, tabular numbers; value text on the left, a Clock icon (lucide) at the far right in muted-foreground; placeholder "Pick a time"; aria-invalid shows the danger border like Input.
- Popover (same Popover surface, radius, padding and shadow as the calendar popover): two side-by-side scrollable columns with small muted column headers "Hour" and "Min" — hours 00–23 and minutes in minuteStep increments (if the current value's minute is not on the step, include it too). Each option looks and behaves like a calendar day cell: same cell size and radius, hover in the neutral hover color, selected option filled with the primary color and primary-foreground text. Column height about 7 options, themed thin scrollbar, the selected option is scrolled into the middle when the popover opens.
- Behavior: picking an hour keeps the popover open; picking a minute commits and closes it. Keyboard: Tab between columns, ArrowUp/ArrowDown move within a column, Enter/Space select, Escape closes. Proper roles (listbox/option, aria-selected) and labels. On phones each option is at least 44px tall and the popover fits the viewport (use the existing mobile-popover rules).
- Use it in PlanWorkoutDialog instead of the native input; validation and the stored value stay the same. Make sure no <input type="time">, type="date" or type="number" remains anywhere.

2. ONE SURFACE COMPONENT
Cards are currently hand-written in at least seven places with different radius and padding ("rounded-md … p-3 md:p-5" in StatTile, DashboardSection, UpcomingWorkouts, BodyWeightForm, WorkoutListItem; "rounded-lg … p-3 md:p-5" in ExerciseCard; "rounded-lg … md:p-6" in CalculatorPage, plus the progress, history-detail and body-weight cards). Create one Surface/Panel component (or adapt the unused shadcn card.tsx) with a single radius, border, background and padding scale (padding variants: default and "flush" for cards that contain a full-width table), plus an "interactive" variant for clickable cards (hover and focus-visible states). Replace every hand-written card with it. Vertical gap between stacked cards must be the same on every page.

3. TYPE SCALE AND SECTION TITLES
Card/section headings differ per page: plain "font-semibold" (Dashboard, Upcoming), "text-base font-semibold" (ExerciseCard), "text-sm font-medium" (Calculator), larger in the Exercises group list. Define one SectionTitle component (title + optional subtitle + optional action slot) and use it for every card/section heading. Define and document the scale: page title, section title, body, secondary/caption, and "figure" sizes for headline numbers (StatTile, records, calculator result). Field labels: always the Label component — replace the muted <span> labels in the calculator and the <p> "Exercises" label in the plan dialog.

4. FORM CONTROLS
- One control height on desktop for inputs, selects, picker triggers and default buttons; the Exercises search (h-10) and the calculator inputs (h-11, bg-surface) must use the standard field instead of one-off overrides. If a large field is really wanted in the calculator, add an explicit size="lg" variant to Input/NumberInput rather than class overrides.
- One field background everywhere (a dedicated --field token, slightly darker than the card it sits on), instead of the current mix of transparent, bg-background and bg-surface.
- Focus: there are two competing systems now — a global 2px outline with offset in styles.css and per-component "focus-visible:outline-none ring-1" (and ring-2 on links and the dialog close button). Keep exactly one: a 2px ring in --ring with a 2px offset in the surface color, defined once and used by buttons, inputs, pickers, links, cards, chips and nav items.

5. COLOR TOKENS AND ELEVATION
- Dialogs use bg-background, which is darker than the cards on the page behind them, so elevation reads inverted. Define a clear 4-step surface ramp and use it consistently: background (page) → card → popover/dialog (lighter than card) → hover/active. Dialog, AlertDialog, Popover, Select, Command and the toast must all sit on the same raised surface with the same border and radius.
- Shadows are invisible on this dark theme: remove the default "shadow"/"shadow-sm" from buttons and inputs; keep one soft shadow only for floating layers (popover, dialog, toast).
- Hover: outline and ghost buttons currently hover to the coral-tinted --accent, while sidebar items hover to neutral grey. Make hover neutral everywhere (one --hover token); reserve the coral tint for selected/active states only.
- Merge near-duplicate neutrals (--secondary, --muted, --sidebar-accent are almost the same value) into the ramp above; remove unused tokens (--surface/--surface-raised if replaced). --chart-5 is nearly identical to --primary and --danger: give the chart palette five clearly distinct hues.
- Dialog overlay: lighten from black/80 to about black/60 with a subtle backdrop blur.
- Radius: raise --radius from 0.5rem to 0.75rem so cards and dialogs get 12px corners and controls 8–10px; check that badges, chips, calendar cells and steppers still look right.

6. SELECTION CONTROLS
The muscle-group filter chips on Exercises use the primary button style, so the selected chip looks like a call-to-action and competes with "Add exercise"; the metric toggle on Progress ("Top weight / Est. 1RM / Volume") uses a different look. Create one SegmentedControl/Chip pattern: unselected = neutral, selected = coral-tinted background with accent text (not the solid primary fill). Use it for both. The solid primary button is then reserved for the single main action of a page.

7. SMALL ITEMS
- Icon-only buttons (video link, change exercise, delete, remove set): use the shadcn Tooltip instead of the native title attribute, same icon size and same muted → foreground / danger hover everywhere.
- Page width: non-dashboard pages are capped at max-w-3xl, leaving a lot of empty space on desktop; use max-w-4xl.
- Phones: confirm the sticky Save bar and the floating "+" button never cover the last set row or the "Add exercise" button on the Workout page (enough bottom padding in every state, including the empty state).

8. DOCUMENT IT
Add a concise "Design system" section to AGENTS.md (tokens and what each is for, the surface ramp, type scale, control sizes, focus rule, when to use primary vs outline vs ghost vs chip, and "never hand-write a card — use Surface"). Keep README changes minimal.

BEFORE FINISHING
Run the type check, lint and production build and fix all errors. Then verify in the browser at desktop width and at 375px, with demo data loaded, and report each item as passed/failed: (a) Plan workout dialog — Date and Time triggers look identical apart from the icon, the time popover matches the calendar popover, selecting 07:30 by mouse and by keyboard works and saves; (b) every page (dashboard, workout, history list/details/edit, exercises, progress, body weight, calculator) uses the same card radius, padding and heading style; (c) keyboard focus ring is identical on a button, an input, a picker trigger, a chip, a history card and a sidebar link; (d) dialogs and popovers are visibly lighter than the cards behind them; (e) no console errors.
