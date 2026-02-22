# Auth Coding Standards

## Rule: Use Clerk for Authentication

This application uses [Clerk](https://clerk.com/) as its sole authentication provider.

**Do not implement any custom authentication logic.** Do not use NextAuth, Auth.js, JWT libraries, session cookies, or any other authentication mechanism. Clerk handles all of this.

## Getting the Authenticated User

To get the current user's ID on the server, use Clerk's `auth()` helper from `@clerk/nextjs/server`:

```ts
import { auth } from "@clerk/nextjs/server";

const { userId } = await auth();
```

This must only be called in **Server Components**, Server Actions, or Route Handlers — never in client components.

## Protecting Pages

### Server Components

Use `auth()` and redirect if no user is present:

```tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // page content
}
```

### Middleware (Preferred for Route-Level Protection)

Use Clerk's middleware to protect routes globally. Define protected routes in `middleware.ts` at the project root:

```ts
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

## Clerk Components

Use Clerk's pre-built UI components for sign-in, sign-up, and user management. Do not build custom auth forms.

```tsx
import { SignIn } from "@clerk/nextjs";
import { SignUp } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
```

- `<SignIn />` — renders the sign-in form
- `<SignUp />` — renders the sign-up form
- `<UserButton />` — renders the current user's avatar with account management

## Allowed Patterns

- Using `auth()` from `@clerk/nextjs/server` in Server Components to get `userId`
- Using Clerk middleware (`clerkMiddleware`) to protect routes
- Using Clerk's pre-built components (`<SignIn />`, `<SignUp />`, `<UserButton />`)
- Passing `userId` obtained from `auth()` to `/data` helper functions (see `data-fetching.md`)

## Prohibited Patterns

- ❌ Using `useUser()` or `useAuth()` client hooks to obtain a `userId` that is then sent to the server or used for data access decisions — `userId` for data fetching must always originate from the server-side `auth()` call
- ❌ Any custom authentication implementation (JWT, sessions, cookies, etc.)
- ❌ Using any authentication library other than Clerk
- ❌ Trusting a `userId` from URL params, query strings, or request bodies for data access (see `data-fetching.md`)
- ❌ Building custom sign-in or sign-up forms

## Environment Variables

Clerk requires the following environment variables. These must be set in `.env.local` and never committed to source control:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
```

Optionally, configure custom redirect paths:

```
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

## Reference

- Clerk Next.js docs: https://clerk.com/docs/quickstarts/nextjs
- Clerk middleware docs: https://clerk.com/docs/references/nextjs/clerk-middleware
- Clerk component reference: https://clerk.com/docs/components/overview
