"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createWorkout } from "./actions";

const formSchema = z.object({
  name: z.string().max(255).optional(),
  startedAt: z.string().min(1, "Start date and time is required"),
});

type FormValues = z.infer<typeof formSchema>;

export function NewWorkoutForm() {
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      startedAt: new Date().toISOString().slice(0, 16),
    },
  });

  async function onSubmit(values: FormValues) {
    const startedAt = new Date(values.startedAt).toISOString();
    const result = await createWorkout({
      name: values.name || undefined,
      startedAt,
    });

    if (result.error) {
      form.setError("root", { message: result.error });
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Workout Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Morning Push Day" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="startedAt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Date &amp; Time</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.formState.errors.root && (
          <p className="text-sm text-destructive">
            {form.formState.errors.root.message}
          </p>
        )}

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Creating..." : "Create Workout"}
        </Button>
      </form>
    </Form>
  );
}
