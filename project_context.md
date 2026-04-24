# Research Management Dashboard (RDMS) Project Context

## 1. Folder Structure & Likely Contents

*   **`app/`**: This is the core of the Next.js App Router containing the actual pages, routing logic, and server actions.
    *   **`actions/`**: Contains React Server Actions. These are backend functions called from the frontend to handle secure data mutations (like creating a thesis proposal, updating user roles, or submitting forms) safely on the server.
    *   **`dashboard/`**: The protected application area spanning multiple user roles. Includes its own `layout.tsx` and sub-directories like `student/` and `coordinator/` to separate concerns and views based on RBAC (Role-Based Access Control).
    *   **`login/` & `register/`**: Explicit routes for user authentication.
*   **`components/`**: Reusable React components that make up the user interface.
    *   **`ui/`**: This frequently indicates a generic component library (likely Shadcn UI) containing primitives like `Button`, `Dialog`, `Select`, etc., utilizing Radix UI.
    *   **Feature Components**: bespoke components like `AppSidebar.tsx`, `UploadModal.tsx`, `DocumentReviewModal.tsx`, and `ChatDialog.tsx` which represent complex internal interactive structures.
*   **`lib/`**: Utility functions, configuration schemas, and external service clients.
    *   **`supabase/`**: Contains configurations to initialize Supabase. Typically split here to handle both client-side and server-side connection instances securely.
    *   **`utils.ts`, `advanced-export.ts`**: Standalone helper functions for repetitive tasks like string manipulation, class merging (`tailwind-merge`), or PDF generation logic.
*   **`public/`**: Static public-facing assets like `favicon.ico`, logos, or external fonts.

## 2. Core Files (Entry Point, Main Logic, Config)

*   **Entry Points:**
    *   **`app/layout.tsx`**: The Root Layout. Everything passes through this file. It sets default HTML/Body document framing, loads global styles (`globals.css`), and applies standard providers (like Theme or Auth contexts).
    *   **`app/page.tsx`**: The main public-facing landing page when the user visits the base URL (`/`).
*   **Main Logic/Services:**
    *   **`lib/supabase/client.ts` & `server.ts`**: Critical core files binding the application to its database and authentication provider (Supabase). Separation ensures that cookies and sessions are read correctly whether the component rendering happens in the browser or on the server.
*   **Config Files:**
    *   **`package.json`**: Manifest declaring dependencies. It shows the app runs on bleeding-edge **Next.js 16** with **React 19**, utilizes **Supabase** for Backend-as-a-Service, **Tailwind CSS v4** for styling, and libraries like Zod for schema validation.
    *   **`next.config.ts`**: The TypeScript-based build and server configuration file for Next.js.
    *   **`eslint.config.mjs`**, **`postcss.config.mjs`**, **`tsconfig.json`**: Standard web tooling configurations for linting, CSS transformation, and TypeScript compilation.

## 3. Overall Architecture and Flow

**Architecture Pattern**:
The application utilizes a modern, server-first **Fullstack React Architecture** driven by Next.js App Router acting as both the frontend client and the backend API layer. The storage and authentication rely on **Supabase** (PostgreSQL).

**Data & Authentication Flow**:
1.  **Public Access**: Users arrive at `app/page.tsx`.
2.  **Authentication**: If they need to enter the system, they proceed to `/login` or `/register`. Submission hits Supabase Auth (likely interacting through a server action or API route to securely set cookies).
3.  **Role Routing**: After authentication, the user session is evaluated. Next.js server components verify the user's role (Student vs. Coordinator) and direct them to their specific portal inside `/dashboard`.
4.  **Dashboard Experience**: Once inside the dashboard layout (`app/dashboard/layout.tsx`), the user is served UI pieces like `AppSidebar.tsx` for navigation.
5.  **Interactions & Mutations**: For creating proposals or uploading reviews, the frontend components (e.g., `UploadModal.tsx`, `DocumentReviewModal.tsx`) communicate utilizing React Server Actions inside `app/actions/`. These actions ensure server-side validation using `Zod` prior to pushing mutations straight to the Supabase Postgres database.
