"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { createWorkoutForUser } from "@/data/workouts";

const createWorkoutSchema = z.object({
  name: z.string().max(255).optional(),
  startedAt: z.string().datetime(),
});

type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;

export async function createWorkout(data: CreateWorkoutInput) {
  const parsed = createWorkoutSchema.safeParse(data);

  if (!parsed.success) {
    return { error: "Invalid input.", details: parsed.error.flatten() };
  }

  const { userId } = await auth();

  if (!userId) {
    return { error: "Unauthorized." };
  }

  await createWorkoutForUser(userId, {
    name: parsed.data.name || undefined,
    startedAt: new Date(parsed.data.startedAt),
  });

  return { success: true };
}
