# my-link - Project Overview

`my-link` is a link curation service that allows users to create a single profile page to share multiple links (social media, portfolios, etc.). It is built using **Next.js 16 (App Router)**, **React 19**, and **Tailwind CSS 4**.

## Project Architecture

- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS 4 (using `@tailwindcss/postcss`)
- **UI Components:** shadcn/ui
- **Language:** TypeScript
- **Backend/Auth:** Firebase (Authentication and Firestore) - *As per PRD*
- **Fonts:** Geist, Geist Mono, and JetBrains Mono (via `next/font`)

## Directory Structure

- `app/`: Contains the application routes, layouts, and global styles.
- `components/`: Reusable React components.
  - `ui/`: shadcn/ui primitive components.
- `docs/`: Project documentation including PRD, User Scenarios, and Wireframes.
- `hooks/`: Custom React hooks.
- `lib/`: Utility functions and shared logic (e.g., `utils.ts` for `cn`).
- `public/`: Static assets.

## Core Page Structure (from Wireframes)

1. **Landing Page:** Minimalist design focused on value proposition and a "Start with Google" button.
2. **Dashboard (Owner View):**
   - **Top Bar:** Displays the profile URL with a copy button and logout option.
   - **Profile Section:** Inline editing for nickname and bio.
   - **Link Section:** Add new links and manage existing ones (title, URL, favicon, delete) using inline editing.
   - **Toast UI:** Immediate feedback (e.g., "Copied!") for user actions.
3. **Public Viewer (Visitor View):**
   - **Header:** Displays owner nickname and bio.
   - **Link List:** Clean list of buttons with favicons leading to external URLs.
   - **Footer:** Minimalist "Made with My Link" watermark.

## Key Features & UI Interactions

1. **Google Login:** Firebase Authentication (Google Social Login only).
2. **Inline Editing Experience:**
   - **Interaction:** Clicking text transforms it into an `input` or `textarea`.
   - **Persistence:** Changes are saved to Firestore on `Enter` or `Blur` (clicking outside).
3. **Link Management:**
   - **Automatic Favicons:** Real-time thumbnail generation using Google Favicon API.
   - **One-click Deletion:** Immediate link removal without confirmation modals to reduce friction.
4. **Validation & Feedback:**
   - **Visual Cues:** Input fields show a red border (`border-red-500`) for invalid or missing URLs.
   - **Toasts:** Non-intrusive notifications for clipboard actions and status updates.

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

### Code Quality

- **Linting:** `npm run lint`
- **Formatting:** `npm run format`
- **Type Checking:** `npm run typecheck`

## Development Conventions

- **App Router:** Follow Next.js App Router conventions for all new routes.
- **Tailwind CSS 4:** Use utility classes for styling.
- **shadcn/ui:** Use `npx shadcn@latest add [component]` to add new UI components.
- **Components:** Functional components with TypeScript interfaces.
- **State Management:** Leverage React hooks and Firebase SDK directly for data fetching/updates.
- **Editing Experience:** Strictly adhere to the **Inline Editing** pattern specified in the PRD and User Scenarios.
- **Error Handling:** Use visual indicators (like red borders) for validation errors rather than intrusive modals.
