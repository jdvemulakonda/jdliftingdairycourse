# Data Fetching Standards

## CRITICAL: Server Components Only

ALL data fetching in this application MUST be done exclusively via **React Server Components**.

The following approaches are **strictly forbidden**:

- ❌ Route handlers (`/app/api/` routes) used for fetching data
- ❌ Client components fetching data (no `useEffect` + `fetch`, no SWR, no React Query, etc.)
- ❌ `getServerSideProps` or `getStaticProps` (not applicable in App Router, but do not attempt)
- ❌ Any other data fetching mechanism outside of Server Components

**Every piece of data that comes from the database must flow through a Server Component.**

## Database Queries via Helper Functions

Database queries must **always** be performed through helper functions located in the `/data` directory.

### Rules

- All `/data` helper functions must use **Drizzle ORM** to query the database
- **Do NOT use raw SQL** — no `db.execute()`, no template literal queries, no pg/mysql drivers directly
- Helper functions should be focused and single-purpose (e.g., `getUserWorkouts`, `getExerciseById`)

### Example Structure

```
/data
  workouts.ts
  exercises.ts
  sets.ts
```

```ts
// data/workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getWorkoutsForUser(userId: string) {
  return db.select().from(workouts).where(eq(workouts.userId, userId));
}
```

```tsx
// app/dashboard/page.tsx (Server Component)
import { getWorkoutsForUser } from "@/data/workouts";
import { auth } from "@/auth";

export default async function DashboardPage() {
  const session = await auth();
  const workouts = await getWorkoutsForUser(session.user.id);

  return <WorkoutList workouts={workouts} />;
}
```

## CRITICAL: User Data Isolation

A logged-in user must **only ever be able to access their own data**. This is a hard security requirement.

### Rules

- Every `/data` helper function that returns user-specific data **must** accept a `userId` parameter
- Every query **must** include a `where` clause filtering by the authenticated user's ID
- The `userId` must always come from the **server-side session** (e.g., `auth()`) — never from user input, URL params, or client-supplied values
- **Never** trust a user ID that comes from the client side

### Correct Pattern

```ts
// data/workouts.ts
export async function getWorkoutsForUser(userId: string) {
  // userId is always passed from the server-side session — never from user input
  return db.select().from(workouts).where(eq(workouts.userId, userId));
}
```

```tsx
// app/dashboard/page.tsx
const session = await auth();

// The userId always comes from the verified server-side session
const workouts = await getWorkoutsForUser(session.user.id);
```

### Incorrect Pattern (Never Do This)

```tsx
// ❌ Never use a userId from params, searchParams, or any client-supplied source
const workouts = await getWorkoutsForUser(params.userId);
const workouts = await getWorkoutsForUser(searchParams.userId);
```

Failing to enforce user data isolation is a **critical security vulnerability**. Every data helper must be written with the assumption that the `userId` argument is the only access control gate — so it must always originate from the authenticated session on the server.
