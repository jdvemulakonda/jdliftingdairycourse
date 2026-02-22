"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { updateWorkoutForUser } from "@/data/workouts";

const updateWorkoutSchema = z.object({
  name: z.string().max(255).optional(),
  startedAt: z.string().datetime(),
});

type UpdateWorkoutInput = z.infer<typeof updateWorkoutSchema>;

export async function updateWorkout(workoutId: string, data: UpdateWorkoutInput) {
  const parsed = updateWorkoutSchema.safeParse(data);

  if (!parsed.success) {
    return { error: "Invalid input.", details: parsed.error.flatten() };
  }

  const { userId } = await auth();

  if (!userId) {
    return { error: "Unauthorized." };
  }

  await updateWorkoutForUser(userId, workoutId, {
    name: parsed.data.name || undefined,
    startedAt: new Date(parsed.data.startedAt),
  });

  return { success: true };
}
