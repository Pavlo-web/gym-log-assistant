import { addDays, startOfWeek } from "date-fns";
import { toIsoDate } from "@/lib/date";
import type {
  BodyWeightEntry,
  Exercise,
  PlannedExercise,
  PlannedWorkout,
  Workout,
  WorkoutEntry,
} from "@/types/domain";

/**
 * Sample records carry this id prefix, which is how they are told apart from
 * the user's own records when they are removed.
 */
const DEMO_ID_PREFIX = "demo-";

export function isDemoId(id: string): boolean {
  return id.startsWith(DEMO_ID_PREFIX);
}

/** How many weeks of training the sample covers, the current week included. */
const WEEKS = 12;

interface DemoLift {
  /** Name of a default exercise. */
  name: string;
  /** Weight in the first week, in kg. */
  start: number;
  /** Average weekly gain, in kg. */
  gain: number;
  /** Smallest step the weight is rounded to, in kg. */
  step: number;
  reps: number;
}

interface DemoSession {
  title: string;
  /** Days after Monday. */
  dayOffset: number;
  lifts: DemoLift[];
}

const SESSIONS: readonly DemoSession[] = [
  {
    title: "Push day",
    dayOffset: 0,
    lifts: [
      { name: "Bench Press", start: 60, gain: 1.25, step: 2.5, reps: 8 },
      { name: "Overhead Press", start: 35, gain: 0.6, step: 2.5, reps: 8 },
      { name: "Incline Dumbbell Press", start: 22, gain: 0.5, step: 2, reps: 10 },
      { name: "Triceps Pushdown", start: 25, gain: 0.6, step: 2.5, reps: 12 },
      { name: "Lateral Raise", start: 8, gain: 0.2, step: 1, reps: 12 },
    ],
  },
  {
    title: "Pull day",
    dayOffset: 2,
    lifts: [
      { name: "Deadlift", start: 90, gain: 2.5, step: 2.5, reps: 5 },
      { name: "Barbell Row", start: 50, gain: 1.25, step: 2.5, reps: 8 },
      { name: "Lat Pulldown", start: 45, gain: 1, step: 2.5, reps: 10 },
      { name: "Barbell Curl", start: 25, gain: 0.5, step: 2.5, reps: 10 },
      { name: "Face Pull", start: 20, gain: 0.5, step: 2.5, reps: 12 },
    ],
  },
  {
    title: "Leg day",
    dayOffset: 4,
    lifts: [
      { name: "Squat", start: 70, gain: 2, step: 2.5, reps: 6 },
      { name: "Romanian Deadlift", start: 60, gain: 1.5, step: 2.5, reps: 8 },
      { name: "Leg Press", start: 120, gain: 3.5, step: 5, reps: 10 },
      { name: "Leg Curl", start: 30, gain: 0.7, step: 2.5, reps: 12 },
      { name: "Standing Calf Raise", start: 40, gain: 1, step: 2.5, reps: 12 },
    ],
  },
];

/** Sessions left out as "week-session", so the calendar does not look machine-made. */
const SKIPPED = new Set(["2-2", "5-1", "8-0", "9-2"]);

/** Reps of the three sets relative to the target; the pattern rotates by week. */
const REP_PATTERNS: readonly (readonly number[])[] = [
  [0, 0, 0],
  [0, 0, -1],
  [1, 0, -1],
];

const NOTES: Readonly<Record<string, string>> = {
  "4-0": "Bench felt strong today.",
  "7-2": "Short on sleep, kept the squat conservative.",
  "10-1": "New deadlift best.",
};

/** Small ups and downs added to the body weight trend, in kg. */
const WEIGHT_WIGGLE = [0, 0.3, -0.2, 0.1, -0.1] as const;
const BODY_WEIGHT_START_KG = 82;
const BODY_WEIGHT_WEEKLY_LOSS_KG = 0.2;
/** Days after Monday on which the sample weighs in. */
const WEIGH_IN_OFFSETS = [0, 3] as const;

function roundTo(value: number, step: number): number {
  return Math.round(value / step) * step;
}

function buildEntry(
  lift: DemoLift,
  exercise: Exercise,
  week: number,
  idBase: string,
): WorkoutEntry {
  const weight = roundTo(lift.start + lift.gain * week, lift.step);
  const pattern = REP_PATTERNS[week % REP_PATTERNS.length] ?? [0, 0, 0];
  return {
    id: `${idBase}-entry`,
    exerciseId: exercise.id,
    exerciseName: exercise.name,
    muscleGroup: exercise.muscleGroup,
    sets: pattern.map((change, index) => ({
      id: `${idBase}-set-${index}`,
      weight,
      reps: lift.reps + change,
    })),
  };
}

function toPlannedExercises(
  session: DemoSession,
  exercisesByName: ReadonlyMap<string, Exercise>,
): PlannedExercise[] {
  return session.lifts.flatMap((lift) => {
    const exercise = exercisesByName.get(lift.name);
    return exercise
      ? [
          {
            exerciseId: exercise.id,
            exerciseName: exercise.name,
            muscleGroup: exercise.muscleGroup,
          },
        ]
      : [];
  });
}

export interface DemoData {
  workouts: Workout[];
  bodyWeight: BodyWeightEntry[];
  plannedWorkouts: PlannedWorkout[];
}

/**
 * Three months of a push / pull / legs routine with steady progress, a body
 * weight trend and two planned workouts. The result depends only on `today`
 * and the exercise library, so loading it twice gives the same records.
 */
export function buildDemoData(today: Date, exercises: readonly Exercise[]): DemoData {
  const exercisesByName = new Map(exercises.map((exercise) => [exercise.name, exercise]));
  const todayIso = toIsoDate(today);
  const firstMonday = addDays(startOfWeek(today, { weekStartsOn: 1 }), -(WEEKS - 1) * 7);

  const workouts: Workout[] = [];
  const bodyWeight: BodyWeightEntry[] = [];

  for (let week = 0; week < WEEKS; week++) {
    const monday = addDays(firstMonday, week * 7);

    SESSIONS.forEach((session, sessionIndex) => {
      const key = `${week}-${sessionIndex}`;
      const date = toIsoDate(addDays(monday, session.dayOffset));
      if (date > todayIso || SKIPPED.has(key)) return;
      const id = `${DEMO_ID_PREFIX}workout-${key}`;
      const timestamp = `${date}T18:00:00.000Z`;
      const notes = NOTES[key];
      workouts.push({
        id,
        date,
        ...(notes ? { notes } : {}),
        entries: session.lifts.flatMap((lift, liftIndex) => {
          const exercise = exercisesByName.get(lift.name);
          return exercise ? [buildEntry(lift, exercise, week, `${id}-${liftIndex}`)] : [];
        }),
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    });

    WEIGH_IN_OFFSETS.forEach((offset, index) => {
      const date = toIsoDate(addDays(monday, offset));
      if (date > todayIso) return;
      const wiggle = WEIGHT_WIGGLE[(week * 2 + index) % WEIGHT_WIGGLE.length] ?? 0;
      const weight = BODY_WEIGHT_START_KG - BODY_WEIGHT_WEEKLY_LOSS_KG * week + wiggle;
      bodyWeight.push({
        id: `${DEMO_ID_PREFIX}weight-${week}-${index}`,
        date,
        weight: Math.round(weight * 10) / 10,
      });
    });
  }

  // One plan that is already due, so it can be started, and one still counting down.
  const createdAt = today.toISOString();
  const [dueSession, laterSession] = [SESSIONS[0], SESSIONS[2]];
  const plannedWorkouts: PlannedWorkout[] = [];
  if (dueSession) {
    plannedWorkouts.push({
      id: `${DEMO_ID_PREFIX}plan-due`,
      date: todayIso,
      time: "07:00",
      title: dueSession.title,
      exercises: toPlannedExercises(dueSession, exercisesByName),
      createdAt,
    });
  }
  if (laterSession) {
    plannedWorkouts.push({
      id: `${DEMO_ID_PREFIX}plan-later`,
      date: toIsoDate(addDays(today, 2)),
      time: "18:30",
      title: laterSession.title,
      exercises: toPlannedExercises(laterSession, exercisesByName),
      createdAt,
    });
  }

  return { workouts, bodyWeight, plannedWorkouts };
}
