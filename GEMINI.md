# Workspace Overview
`my-link` is a workspace that currently contains a single project: `my-profile`.

## Project: `my-profile`
`my-profile` is a modern web application built with **Next.js (App Router)**, **TypeScript**, and **Tailwind CSS**. It serves as a personal profile or landing page, bootstrapped using `create-next-app`.

### Tech Stack
- **Framework:** Next.js 16.1.6
- **Library:** React 19.2.3
- **Styling:** Tailwind CSS 4 (with PostCSS)
- **Language:** TypeScript
- **Fonts:** Geist Sans & Geist Mono (via `next/font`)

### Building and Running
To run the project, navigate to the `my-profile` directory:

```bash
cd my-profile
```

- **Development:** `npm run dev`
- **Build:** `npm run build`
- **Start:** `npm run start`
- **Lint:** `npm run lint`

## Project Structure
- `my-profile/app/`: Contains the application routes, layouts, and global styles.
  - `layout.tsx`: The root layout defining the HTML structure and global fonts.
  - `page.tsx`: The main entry point for the home route.
  - `globals.css`: Global CSS and Tailwind directives.
- `my-profile/public/`: Static assets such as images and SVGs.
- `my-profile/next.config.ts`: Next.js configuration.
- `my-profile/tsconfig.json`: TypeScript configuration.

## Development Conventions
- **Component Architecture:** Use React Server Components (RSC) by default. Use `"use client"` directive only when client-side interactivity (state, effects, event listeners) is required.
- **Styling:** Use Tailwind CSS utility classes for styling. Follow the existing pattern of using Zinc/Black color scales for dark mode support.
- **Type Safety:** Ensure all components and functions are properly typed using TypeScript.
- **Image Optimization:** Always use the `next/image` component for optimized image loading.
- **File Naming:** Use kebab-case or PascalCase consistently for components and directories within `app/`.
