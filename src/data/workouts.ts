import { db } from "@/db";
import { workouts } from "@/db/schema";
import { and, eq, gte, lt } from "drizzle-orm";

export async function createWorkoutForUser(
  userId: string,
  data: { name?: string; startedAt: Date }
) {
  return db.insert(workouts).values({ ...data, userId });
}

export async function getWorkoutByIdForUser(userId: string, workoutId: string) {
  const results = await db
    .select()
    .from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));
  return results[0] ?? null;
}

export async function updateWorkoutForUser(
  userId: string,
  workoutId: string,
  data: { name?: string; startedAt: Date }
) {
  return db
    .update(workouts)
    .set(data)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));
}

export async function getWorkoutsForUserOnDate(userId: string, date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  return db
    .select()
    .from(workouts)
    .where(
      and(
        eq(workouts.userId, userId),
        gte(workouts.startedAt, start),
        lt(workouts.startedAt, end)
      )
    );
}
