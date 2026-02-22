# Server Components Coding Standards

## Params and SearchParams Must Be Awaited

This project uses **Next.js 15**, where `params` and `searchParams` are **Promises**. They must always be `await`ed before accessing any properties. Accessing them synchronously will result in a runtime error.

### Rules

- Always type `params` and `searchParams` as `Promise<...>` in page props interfaces
- Always `await` them before destructuring or accessing any property
- Never access `params.someKey` or `searchParams.someKey` directly without awaiting first

### Correct Pattern

```tsx
// app/dashboard/workout/[workoutId]/page.tsx

interface EditWorkoutPageProps {
  params: Promise<{ workoutId: string }>;
  searchParams: Promise<{ date?: string }>;
}

export default async function EditWorkoutPage({ params, searchParams }: EditWorkoutPageProps) {
  const { workoutId } = await params;
  const { date } = await searchParams;

  // use workoutId and date...
}
```

### Incorrect Pattern (Never Do This)

```tsx
// ❌ params is a Promise — never access properties without awaiting
export default async function EditWorkoutPage({ params }: EditWorkoutPageProps) {
  const workoutId = params.workoutId; // ❌ runtime error
}
```

## Server Components Must Be Async

All Server Components that perform data fetching, access params, or call any async API must be declared as `async` functions.

```tsx
// ✅ Correct
export default async function WorkoutPage({ params }: WorkoutPageProps) {
  const { workoutId } = await params;
  // ...
}

// ❌ Incorrect — cannot await params or data fetching without async
export default function WorkoutPage({ params }: WorkoutPageProps) {
  // ...
}
```

## No Client-Side APIs in Server Components

Server Components run exclusively on the server. Never use browser or client-only APIs inside them:

- ❌ `window`, `document`, `localStorage`, `sessionStorage`
- ❌ `useState`, `useEffect`, `useRouter`, or any React hook
- ❌ Event handlers (`onClick`, `onChange`, etc.)

If you need any of the above, move that logic into a Client Component (`"use client"`).

## `dynamic` with `ssr: false` Must Live in a Client Component

`next/dynamic` with `{ ssr: false }` is only valid inside a Client Component. It cannot be used directly in a Server Component.

### Correct Pattern

```tsx
// EditWorkoutFormClient.tsx
"use client";

import dynamic from "next/dynamic";

const EditWorkoutForm = dynamic(
  () => import("./EditWorkoutForm").then((m) => m.EditWorkoutForm),
  { ssr: false }
);

export { EditWorkoutForm };
```

```tsx
// page.tsx (Server Component)
import { EditWorkoutForm } from "./EditWorkoutFormClient"; // ✅ import from the client wrapper
```

### Incorrect Pattern

```tsx
// page.tsx (Server Component)
import dynamic from "next/dynamic";

// ❌ ssr: false is not allowed in a Server Component
const EditWorkoutForm = dynamic(() => import("./EditWorkoutForm"), { ssr: false });
```
