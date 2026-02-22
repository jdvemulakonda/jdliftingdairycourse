# UI Coding Standards

## Rule: Use shadcn/ui Components Only

All UI in this project must be built exclusively using [shadcn/ui](https://ui.shadcn.com/) components.

**No custom UI components are permitted.** Do not create custom buttons, inputs, modals, cards, dropdowns, or any other UI primitives. If shadcn/ui provides a component for the use case, use it.

## Adding Components

Install shadcn/ui components via the CLI:

```bash
npx shadcn@latest add <component-name>
```

Components are added to `src/components/ui/`. Do not modify these generated files.

## Allowed Patterns

- Composing shadcn/ui components together to build pages and features
- Passing props and variants supported by the component API
- Applying Tailwind utility classes to shadcn/ui components for layout and spacing

## Prohibited Patterns

- Creating new files in `src/components/` that define custom UI primitives
- Writing raw `<button>`, `<input>`, `<select>`, `<dialog>`, or similar HTML elements directly in page or feature code — use the shadcn/ui equivalents instead
- Copying and modifying shadcn/ui component source to create variants
- Using any third-party UI component library other than shadcn/ui

## Date Formatting

All dates must be formatted using [date-fns](https://date-fns.org/).

**Required format:** ordinal day, abbreviated month, 4-digit year.

```
1st Sep 2025
2nd Aug 2025
3rd Jan 2026
4th Jun 2024
```

Use the `do MMM yyyy` format string:

```ts
import { format } from "date-fns";

format(date, "do MMM yyyy"); // e.g. "1st Sep 2025"
```

Do not use `Date.toLocaleDateString()`, `Intl.DateTimeFormat`, or any other date formatting library.

## Reference

- shadcn/ui component list: https://ui.shadcn.com/docs/components
- This project's component config: `components.json`
- date-fns format tokens: https://date-fns.org/docs/format
