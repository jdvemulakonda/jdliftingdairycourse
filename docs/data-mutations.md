# Data Mutations Standards

## CRITICAL: Server Actions Only

ALL data mutations in this application MUST be performed exclusively via **Next.js Server Actions**.

The following approaches are **strictly forbidden**:

- ❌ Route handlers (`/app/api/` routes) used for mutating data
- ❌ Client-side `fetch` calls to mutate data
- ❌ Mutating data directly inside Server Components
- ❌ Any mutation mechanism outside of Server Actions

## Server Actions via Colocated `actions.ts` Files

Server Actions must be defined in colocated `actions.ts` files, placed alongside the route or feature they belong to.

### Rules

- Every `actions.ts` file **must** begin with the `"use server"` directive
- Server Actions must **not** be defined inline inside components
- One `actions.ts` file per route/feature directory — do not create global or shared action files unless the action is genuinely shared across multiple features

### Example Structure

```
/app
  /workouts
    /new
      page.tsx
      actions.ts   ← server actions for the new workout form
  /exercises
    /[id]
      page.tsx
      actions.ts   ← server actions for a specific exercise
```

## Typed Parameters — No FormData

Server Action parameters **must** be explicitly typed using TypeScript. `FormData` is **strictly forbidden** as a parameter type.

The following is **never** acceptable:

```ts
// ❌ Never use FormData as a parameter type
export async function createWorkout(formData: FormData) { ... }
```

Instead, accept typed objects:

```ts
// ✅ Always use typed parameters
export async function createWorkout(data: CreateWorkoutInput) { ... }
```

## Argument Validation via Zod

Every Server Action **must** validate all arguments using [Zod](https://zod.dev/) before performing any database operation. Do not trust input — validate it unconditionally, even when the call originates from your own UI.

### Rules

- Define a Zod schema for every Server Action's input
- Call `.parse()` or `.safeParse()` at the top of every action before any other logic
- If validation fails, return a structured error — do not throw unhandled exceptions to the client

### Example

```ts
// app/workouts/new/actions.ts
"use server";

import { z } from "zod";
import { createWorkoutForUser } from "@/data/workouts";
import { auth } from "@/auth";

const createWorkoutSchema = z.object({
  name: z.string().min(1).max(100),
  date: z.string().date(),
  notes: z.string().max(500).optional(),
});

type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;

export async function createWorkout(data: CreateWorkoutInput) {
  const parsed = createWorkoutSchema.safeParse(data);

  if (!parsed.success) {
    return { error: "Invalid input.", details: parsed.error.flatten() };
  }

  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Unauthorized." };
  }

  await createWorkoutForUser(session.user.id, parsed.data);

  return { success: true };
}
```

## No Redirects in Server Actions

Server Actions **must not** call `redirect()`. Redirects are strictly forbidden inside Server Actions.

Instead, Server Actions must return a result object to the client. The calling client component is responsible for inspecting the result and performing any navigation using the Next.js `useRouter` hook.

### Correct Pattern

```ts
// app/workouts/new/actions.ts
"use server";

export async function createWorkout(data: CreateWorkoutInput) {
  // ... validate and mutate ...

  return { success: true };
}
```

```tsx
// Client component
"use client";

import { useRouter } from "next/navigation";
import { createWorkout } from "./actions";

const router = useRouter();

async function onSubmit(values: FormValues) {
  const result = await createWorkout(values);

  if (result.success) {
    router.push("/dashboard");
  }
}
```

### Incorrect Pattern (Never Do This)

```ts
// ❌ Never redirect inside a Server Action
import { redirect } from "next/navigation";

export async function createWorkout(data: CreateWorkoutInput) {
  // ... validate and mutate ...

  redirect("/dashboard"); // ❌ forbidden
}
```

## Database Mutations via Helper Functions

Database mutations must **always** be performed through helper functions located in the `/data` directory. Server Actions must **never** call Drizzle ORM directly.

### Rules

- All `/data` mutation helper functions must use **Drizzle ORM**
- **Do NOT use raw SQL** — no `db.execute()`, no template literal queries
- Helper functions should be focused and single-purpose (e.g., `createWorkoutForUser`, `deleteExerciseById`, `updateSetWeight`)
- Mutation helpers should accept a `userId` parameter and enforce ownership where applicable (see User Data Isolation below)

### Example Structure

```
/data
  workouts.ts   ← getWorkoutsForUser, createWorkoutForUser, deleteWorkoutById
  exercises.ts
  sets.ts
```

```ts
// data/workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function createWorkoutForUser(
  userId: string,
  data: { name: string; date: string; notes?: string }
) {
  return db.insert(workouts).values({ ...data, userId });
}

export async function deleteWorkoutById(userId: string, workoutId: string) {
  // userId is used to scope the delete — a user can only delete their own workouts
  return db
    .delete(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));
}
```

## CRITICAL: User Data Isolation in Mutations

A logged-in user must **only ever be able to mutate their own data**. This is a hard security requirement.

### Rules

- The `userId` used in any mutation **must** always come from the **server-side session** (e.g., `auth()`) inside the Server Action — never from the client-supplied action arguments
- `/data` mutation helpers that operate on user-owned records **must** include a `userId` condition in the query (e.g., `where(and(eq(...id), eq(...userId)))`) to prevent cross-user tampering
- **Never** accept a `userId` as a parameter from the client

### Correct Pattern

```ts
// app/workouts/actions.ts
"use server";

export async function deleteWorkout(workoutId: string) {
  // userId always comes from the server-side session — never from the client
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Unauthorized." };
  }

  await deleteWorkoutById(session.user.id, workoutId);

  return { success: true };
}
```

### Incorrect Pattern (Never Do This)

```ts
// ❌ Never accept userId from the client — it cannot be trusted
export async function deleteWorkout(userId: string, workoutId: string) {
  await deleteWorkoutById(userId, workoutId);
}
```

Failing to enforce user data isolation in mutations is a **critical security vulnerability**. Always obtain the `userId` from the authenticated server-side session within the Server Action itself.
