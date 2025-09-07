# Hotel Management Software

## Overview

This is a full-stack hotel management software built as a mobile-optimized web application. The system provides comprehensive functionality for managing hotel operations including inventory management, sales tracking, expense management, employee management, and financial reporting. The application is designed with a mobile-first approach, featuring a responsive design that works seamlessly on devices ranging from 360px to 768px width.

The software follows a modular architecture with 10 main functional modules: Add Items, Inventory Management, Sales, Daily Account Reports, Expenses, Borrowers, Depositors, Online Payments, Employee Management, and Company Information management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Custom component library built on Radix UI primitives with shadcn/ui styling
- **Styling**: Tailwind CSS with custom CSS variables for theming and mobile-responsive design
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation for type-safe form management

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **API Design**: RESTful API architecture with modular route organization
- **Development Setup**: Development server with Vite integration for hot module replacement
- **Build Process**: ESBuild for production bundling with platform-specific optimizations

### Database Layer
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL with Neon Database serverless integration
- **Schema Management**: Drizzle Kit for database migrations and schema management
- **Type Safety**: Full TypeScript integration with Drizzle Zod for runtime validation

### Component Architecture
- **Design System**: Modular component library with consistent styling and behavior
- **Responsive Design**: Mobile-first approach with Bootstrap-inspired layout system
- **Accessibility**: Built on Radix UI primitives ensuring ARIA compliance
- **Navigation**: Bottom navigation pattern optimized for mobile interaction

### Data Flow Pattern
- **Query Management**: Centralized API layer with React Query for caching and synchronization
- **Type Safety**: Shared TypeScript schemas between client and server
- **Error Handling**: Centralized error handling with user-friendly toast notifications
- **Real-time Updates**: Optimistic updates with automatic cache invalidation

### Mobile Optimization
- **Touch Interface**: Touch-friendly UI components with appropriate sizing
- **Performance**: Optimized bundle sizes and lazy loading for fast mobile performance
- **Layout**: Responsive grid system that adapts to different screen sizes
- **Navigation**: Bottom navigation bar for easy thumb navigation on mobile devices

## External Dependencies

### Database and ORM
- **Neon Database**: Serverless PostgreSQL database hosting
- **Drizzle ORM**: TypeScript ORM for database operations and migrations
- **Drizzle Zod**: Runtime validation and type safety integration

### UI and Styling
- **Radix UI**: Headless UI components for accessibility and functionality
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Lucide React**: Icon library for consistent iconography
- **Class Variance Authority**: Type-safe CSS class composition

### State and Data Management
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form state management and validation
- **Zod**: Schema validation and type inference

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety and development experience
- **ESBuild**: Fast JavaScript bundler for production builds

### Fonts and Assets
- **Google Fonts**: Custom font integration (Architects Daughter, DM Sans, Fira Code, Geist Mono)
- **Date-fns**: Date manipulation and formatting utilities

## Enhancements (September 2025)

### New Functional Requirements

1. **Delete Functionality**
   - A delete button must be available for all record types:
     - Expenses
     - Borrowers
     - Depositors
     - Online payments
   - Deletion should remove the record from the daily account and update balances accordingly.

2. **Borrower & Depositor Handling**
   - **Returning Borrowed Money**
     - When borrowed money (expenses, borrower, online, deposited) is returned to the person, it must be deducted from the daily account.
   - **Deposited Money**
     - Deposits must be added to the daily account and reflected as *cash in*.
   - **Previous Borrower Amount**
     - A separate field must store the borrower’s pre-existing balance (before the system started).
     - This amount should not affect the daily account initially.
     - When the borrower deposits against this old balance, it should reflect in the daily account as *cash in*.

3. **Daily Account History**
   - Ability to select a specific date and view the daily account snapshot for that day.
   - Historical view must be *read-only* (no edits allowed).

4. **Daily Reset**
   - A reset button must be available for the current day.
   - Reset clears all today’s transactions and resets balances to the day’s start.

### Technical Adjustments Needed

- **Database Changes**
  - Add `borrower_previous_balance` column (excluded from daily calculations).
  - Introduce delete handling in `expenses`, `borrowers`, `depositors`, `online_payments` tables (soft-delete or permanent delete).
  - Add a transaction log table to maintain daily account history.

- **API Changes**
  - `DELETE /expenses/:id`
  - `DELETE /borrowers/:id`
  - `DELETE /depositors/:id`
  - `DELETE /online/:id`
  - `POST /daily/reset` (reset current day’s data)
  - `GET /daily/:date` (fetch daily account snapshot)

- **Frontend Changes**
  - Add delete buttons with confirmation dialogs.
  - Add reset button for today’s account.
  - Add date picker for viewing daily history in read-only mode.
