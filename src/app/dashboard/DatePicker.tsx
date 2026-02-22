"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";

import { Calendar } from "@/components/ui/calendar";

interface DatePickerProps {
  date: Date;
}

export function DatePicker({ date }: DatePickerProps) {
  const router = useRouter();

  function handleSelect(day: Date | undefined) {
    if (!day) return;
    router.push(`/dashboard?date=${format(day, "yyyy-MM-dd")}`);
  }

  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={handleSelect}
    />
  );
}
