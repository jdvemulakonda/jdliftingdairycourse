# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server on http://localhost:3000
npm run build    # Production build
npm start        # Run production build
npm run lint     # Run ESLint
```

## Architecture

Next.js 16 app using the App Router (`src/app/`). React 19, TypeScript, Tailwind CSS v4.

- `src/app/layout.tsx` — Root layout with Geist font setup and metadata
- `src/app/page.tsx` — Home page
- `src/app/globals.css` — Tailwind import and CSS custom properties for light/dark theming

Use the `@/` path alias to import from `src/` (e.g., `@/components/Foo`).
