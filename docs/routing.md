# Routing Standards

## Rule: All App Routes Live Under `/dashboard`

All application pages must be nested under the `/dashboard` route segment.

```
src/app/
  page.tsx                          — Public home/landing page
  dashboard/
    page.tsx                        — Dashboard home (/dashboard)
    workout/
      new/
        page.tsx                    — Create workout (/dashboard/workout/new)
      [workoutId]/
        page.tsx                    — View/edit workout (/dashboard/workout/:id)
```

Do not create top-level app routes for authenticated features. All feature pages belong inside `src/app/dashboard/`.

## Rule: Protect Dashboard Routes via Middleware

All routes under `/dashboard` must be protected so that only authenticated users can access them. Route protection must be implemented in `middleware.ts` at the project root using Clerk's middleware.

**Do not** protect routes by checking `userId` inside individual page components as the primary access control mechanism — middleware is the correct place for this.

```ts
// middleware.ts (project root)
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
```

The `/dashboard(.*)` matcher covers the dashboard index and all nested routes (e.g. `/dashboard/workout/new`, `/dashboard/workout/[workoutId]`).

## Allowed Patterns

- All authenticated feature pages are placed under `src/app/dashboard/`
- Middleware (`middleware.ts`) handles route-level authentication for all `/dashboard` routes
- Dynamic route segments use bracket notation: `[workoutId]`, `[exerciseId]`, etc.
- Nested routes reflect the resource hierarchy (e.g. `/dashboard/workout/[workoutId]/sets`)

## Prohibited Patterns

- ❌ Creating authenticated feature pages outside of `src/app/dashboard/`
- ❌ Relying solely on per-page `auth()` checks as the route protection strategy — middleware must always be in place
- ❌ Placing the `middleware.ts` file anywhere other than the project root
- ❌ Unprotected routes under `/dashboard` (the middleware matcher must cover all sub-paths)

## Reference

- Next.js App Router routing: https://nextjs.org/docs/app/building-your-application/routing
- Clerk middleware docs: https://clerk.com/docs/references/nextjs/clerk-middleware
