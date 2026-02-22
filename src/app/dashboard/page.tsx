import { auth } from "@clerk/nextjs/server";
import { format } from "date-fns";
import { DumbbellIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getWorkoutsForUserOnDate } from "@/data/workouts";
import { DatePicker } from "./DatePicker";

interface DashboardPageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { userId } = await auth();
  const { date: dateParam } = await searchParams;

  const date = dateParam ? new Date(dateParam) : new Date();
  date.setHours(0, 0, 0, 0);

  const workouts = await getWorkoutsForUserOnDate(userId!, date);

  const formattedDate = format(date, "do MMM yyyy");

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Dashboard</h1>

      <div className="flex flex-col gap-8 md:flex-row md:items-start">
        {/* Date Picker */}
        <div className="shrink-0">
          <DatePicker date={date} />
        </div>

        {/* Workout List */}
        <div className="min-w-0 flex-1 space-y-4">
          <h2 className="text-xl font-semibold">
            Workouts logged
            <span className="ml-2 text-muted-foreground text-base font-normal">
              ({workouts.length})
            </span>
          </h2>

          {workouts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <DumbbellIcon className="mb-3 h-10 w-10 text-muted-foreground" />
                <p className="text-muted-foreground">
                  No workouts logged for {formattedDate}.
                </p>
              </CardContent>
            </Card>
          ) : (
            workouts.map((workout) => (
              <Card key={workout.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">
                    {workout.name ?? "Workout"}
                  </CardTitle>
                  <CardDescription>
                    Started at {format(workout.startedAt, "h:mm a")}
                  </CardDescription>
                </CardHeader>
                {workout.completedAt && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Completed at {format(workout.completedAt, "h:mm a")}
                    </p>
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
