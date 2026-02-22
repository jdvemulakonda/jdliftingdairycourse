import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NewWorkoutForm } from "./NewWorkoutForm";

export default async function NewWorkoutPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="container mx-auto max-w-lg px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">New Workout</h1>
      <Card>
        <CardHeader>
          <CardTitle>Log a Workout</CardTitle>
        </CardHeader>
        <CardContent>
          <NewWorkoutForm />
        </CardContent>
      </Card>
    </div>
  );
}
