import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getWorkoutByIdForUser } from "@/data/workouts";
import { EditWorkoutForm } from "./EditWorkoutFormClient";

interface EditWorkoutPageProps {
  params: Promise<{ workoutId: string }>;
}

export default async function EditWorkoutPage({ params }: EditWorkoutPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { workoutId } = await params;
  const workout = await getWorkoutByIdForUser(userId, workoutId);

  if (!workout) {
    notFound();
  }

  const defaultValues = {
    name: workout.name ?? "",
    startedAt: workout.startedAt.toISOString().slice(0, 16),
  };

  return (
    <div className="container mx-auto max-w-lg px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Edit Workout</h1>
      <Card>
        <CardHeader>
          <CardTitle>{workout.name ?? "Untitled Workout"}</CardTitle>
        </CardHeader>
        <CardContent>
          <EditWorkoutForm workoutId={workoutId} defaultValues={defaultValues} />
        </CardContent>
      </Card>
    </div>
  );
}
