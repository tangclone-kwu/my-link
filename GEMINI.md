# my-link - Project Overview

`my-link` is a modern web application built using **Next.js 16** (App Router), **React 19**, and **Tailwind CSS 4**. It is configured with **TypeScript** for type safety and **ESLint** for code quality.

## Project Architecture

- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS 4 (using `@tailwindcss/postcss`)
- **Language:** TypeScript
- **Fonts:** Geist and Geist Mono (via `next/font`)

## Directory Structure

- `src/app/`: Contains the application routes, layouts, and global styles.
- `public/`: Static assets such as images and SVGs.
- `eslint.config.mjs`: ESLint configuration.
- `next.config.ts`: Next.js specific configuration.
- `postcss.config.mjs`: PostCSS configuration for Tailwind CSS.
- `tsconfig.json`: TypeScript configuration.

## Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed.

### Installation

```bash
npm install
```

### Development

Start the development server with Turbopack:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Building and Deployment

Build the application for production:

```bash
npm run build
```

Start the production server:

```bash
npm run start
```

### Linting

Run ESLint to check for code quality issues:

```bash
npm run lint
```

## Development Conventions

- **App Router:** All new pages should be created within the `src/app` directory following Next.js App Router conventions.
- **Tailwind CSS 4:** Use utility classes for styling. Global styles are managed in `src/app/globals.css`.
- **Components:** Prefer functional components with TypeScript interfaces for props.
- **Icons/Images:** Use `next/image` for optimized image rendering.
