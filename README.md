# Gym Log Assistant

Build the foundation of "Gym Log" — a personal gym workout diary with a 1RM calculator. Single user, desktop-first, English UI. In this first step build ONLY the app shell, the data layer, and the 1RM Calculator page. The other pages are placeholders for now; I will request them one at a time later.

DESIGN
- Dark theme only, minimalist: near-black background, subtle card surfaces, thin borders, one accent color (a muted lime/green), generous spacing, clean sans-serif type, tabular numbers for weights/reps. No gradients, no decorative imagery.
- Desktop-first layout: fixed left sidebar with the app name "Gym Log" and nav items: Workout, History, Exercises, Progress, 1RM Calculator. Main content in a centered max-width container. It should not break on narrow screens, but mobile polish is not a goal.
- Define all colors as semantic design tokens in the theme; no hard-coded colors in components.

ROUTES
- /            Workout (placeholder: "Coming soon")
- /history     History (placeholder)
- /exercises   Exercises (placeholder)
- /progress    Progress (placeholder)
- /calculator  1RM Calculator (fully working)
Placeholders should be simple, consistent empty-state pages with the page title.

DATA LAYER (important — build it now even though the placeholder pages do not use it yet)
Data is stored in the browser's localStorage for now, but must be easy to swap for a real database with authentication later. Therefore:
- Domain types in one file:
  - Exercise { id, name, muscleGroup: "Chest" | "Back" | "Legs" | "Shoulders" | "Arms" | "Core", isCustom, userId? }
  - WorkoutSet { id, weight (kg), reps }
  - WorkoutEntry { id, exerciseId, sets: WorkoutSet[] }
  - Workout { id, date (ISO yyyy-mm-dd), notes?, entries: WorkoutEntry[], userId?, createdAt, updatedAt }
- Repository interfaces with async (Promise-returning) methods: ExerciseRepository (list, create, delete) and WorkoutRepository (list, getById, create, update, delete).
- localStorage implementations of these interfaces, exported from a single module so the implementation can be replaced in one place. UI components must NEVER touch localStorage directly — only through the repositories, wrapped in React Query hooks (e.g. useExercises, useWorkouts).
- IDs are UUIDs (crypto.randomUUID). Use versioned storage keys. Handle corrupted/missing storage gracefully.
- Seed about 30 common default exercises (isCustom: false) spread across the six muscle groups, e.g. Bench Press, Incline Dumbbell Press, Squat, Deadlift, Romanian Deadlift, Leg Press, Overhead Press, Lateral Raise, Pull-Up, Barbell Row, Lat Pulldown, Barbell Curl, Triceps Pushdown, Plank, etc.
- Pure calculation helpers in a separate lib file (no React): epley1RM(weight, reps), brzycki1RM(weight, reps), workoutVolume(workout). These will be reused by the Progress page later.

1RM CALCULATOR PAGE
- Inputs: Weight (kg, decimals allowed) and Reps (integer 1–20). Results update live, no submit button.
- Show estimated 1RM by the Epley formula (weight × (1 + reps/30)) as the primary large number, and the Brzycki estimate (weight × 36 / (37 − reps)) as a secondary smaller value. If reps = 1, the 1RM equals the entered weight.
- Percentage table based on the Epley 1RM: rows from 100% down to 50% in 5% steps, columns: Percent, Weight (kg, rounded to nearest 0.5), Approx. reps possible at that load.
- Validate input: empty, zero or negative values show a neutral empty state rather than NaN; reps above 20 show a small hint that estimates are unreliable.
- Sanity check: 100 kg × 5 reps → Epley ≈ 116.7 kg.

OUT OF SCOPE: authentication, backend/database, AI features, social features, payments. Do not add them.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://gym-log-assistant.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d43f0fa9-f454-42a8-ba8c-a42ba164506f).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
