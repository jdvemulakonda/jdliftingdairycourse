"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, DumbbellIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Placeholder workout data for UI demonstration
const PLACEHOLDER_WORKOUTS = [
  {
    id: 1,
    name: "Bench Press",
    sets: 4,
    reps: 8,
    weight: "80kg",
    category: "Chest",
  },
  {
    id: 2,
    name: "Squat",
    sets: 5,
    reps: 5,
    weight: "100kg",
    category: "Legs",
  },
  {
    id: 3,
    name: "Deadlift",
    sets: 3,
    reps: 5,
    weight: "120kg",
    category: "Back",
  },
  {
    id: 4,
    name: "Overhead Press",
    sets: 4,
    reps: 10,
    weight: "50kg",
    category: "Shoulders",
  },
];

export default function DashboardPage() {
  const [date, setDate] = useState<Date>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });
  const [open, setOpen] = useState(false);

  const formattedDate = format(date, "do MMM yyyy");

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Dashboard</h1>

      {/* Date Picker */}
      <div className="mb-8">
        <p className="mb-2 text-sm font-medium text-muted-foreground">
          Viewing workouts for
        </p>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start gap-2 sm:w-auto">
              <CalendarIcon className="h-4 w-4" />
              {formattedDate}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(day) => {
                if (day) {
                  setDate(day);
                  setOpen(false);
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Workout List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          Workouts logged
          <span className="ml-2 text-muted-foreground text-base font-normal">
            ({PLACEHOLDER_WORKOUTS.length})
          </span>
        </h2>

        {PLACEHOLDER_WORKOUTS.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <DumbbellIcon className="mb-3 h-10 w-10 text-muted-foreground" />
              <p className="text-muted-foreground">
                No workouts logged for {formattedDate}.
              </p>
            </CardContent>
          </Card>
        ) : (
          PLACEHOLDER_WORKOUTS.map((workout) => (
            <Card key={workout.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{workout.name}</CardTitle>
                  <Badge variant="secondary">{workout.category}</Badge>
                </div>
                <CardDescription>
                  {workout.sets} sets &times; {workout.reps} reps
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{workout.weight}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
