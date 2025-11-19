# DesignCost Pro

A comprehensive costing, quoting, and client management application for interior design professionals.

## Overview

DesignCost Pro is an all-in-one tool designed to streamline the business operations of interior design studios. It helps professionals move from initial cost calculations to generating professional client quotes, all while managing clients, properties, and projects in a single, cohesive interface. The application is built as a responsive web app.

## Core Features

- **Dashboard:** A high-level overview of your business metrics, including revenue, client counts, and project statuses.
- **Costing Tool:** An intuitive and powerful calculator to build detailed project cost breakdowns, including materials, labor, operational costs, taxes, and profit margins.
- **Profit Allocator:** A unique tool to visualize and distribute your project profits into different business areas like savings, development, and CSR.
- **Quote Generation:** Publish polished, professional quotes directly from your costings.
- **AI-Powered Material Suggestions:** An intelligent tool that provides dynamic suggestions for material alternatives based on budget constraints, analyzing price and availability to offer recommendations with pros and cons.
- **Client Relationship Management (CRM):** A central hub to manage all your clients, track communications, and view their associated projects and properties.
-**Project & Property Management:** Organize and track all your ongoing projects and link them to specific client properties.
- **Data Export:** Export your quotes to CSV for offline analysis or use in other business tools.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI Library:** React 19 with Server Components
- **Styling:** Tailwind CSS
- **Components:** shadcn/ui
- **State Management:** Zustand
- **Form Handling:** React Hook Form
- **Schema Validation:** Zod
- **Database:** Prisma
- **Icons:** Lucide React
- **Charts:** Recharts

## Project Structure

The project is organized to be scalable and maintainable. Here are the key directories:

- `/src/app/(app)`: Contains the main application pages, organized by route. It uses a Next.js App Router layout (`layout.tsx`).
- `/src/app`: Contains the root layout (`layout.tsx`) and the landing page (`page.tsx`).
- `/src/components/design`: Custom, application-specific React components that make up the UI (e.g., `ClientCard`, `CostForm`).
- `/src/components/ui`: Core, reusable UI components from `shadcn/ui` (e.g., `Button`, `Card`).
- `/src/store`: Home to the Zustand store (`cost-store.ts`), which manages all application state.
- `/src/lib`: Contains utility functions (`utils.ts`) and server-less actions (`actions.ts`) that interact with the store.
- `/src/hooks`: Custom React hooks used throughout the application (e.g., `use-hydrated-store.ts`).

## Getting Started

To get the project running locally, follow these steps:

1.  **Install Dependencies:**
    Open a terminal in the project's root directory and run:
    ```bash
    pnpm install
    ```

2.  **Push the Database Schema:**
    ```bash
    pnpm db:push
    ```

3.  **Seed the Database:**
    ```bash
    pnpm prisma:seed
    ```

4.  **Run the Development Server:**
    After the installation is complete, start the Next.js development server:
    ```bash
    pnpm dev
    ```

5.  **Open the Application:**
    Open your browser and navigate to [http://localhost:9002](http://localhost:9002) to see the application in action.

## Database Seeding

The database is seeded with initial data using Prisma. The seed script is located in `prisma/seed.ts`. To manually seed the database, run the following command:

```bash
pnpm prisma:seed
```

## Deployment

This application is designed to be deployed to any platform that supports Next.js. Here are the general steps for deployment:

1.  **Build the Application:**
    ```bash
    pnpm build
    ```

2.  **Start the Application:**
    ```bash
    pnpm start
    ```

For more detailed instructions, please refer to the documentation of your deployment platform of choice.
