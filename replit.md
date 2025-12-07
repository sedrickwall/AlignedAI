# Aligned - Faith-based AI Prioritization App

## Overview

Aligned is a productivity and wellness application designed for multi-gifted women seeking to live their calling with clarity, peace, and structure. The app combines faith-based guidance with AI-driven prioritization to help users align their daily activities with their values and long-term goals.

**Core Purpose**: Provide a calm, focused environment for daily planning, energy tracking, and weekly reflection through a faith-centered lens.

**Target Users**: Multi-gifted women seeking to balance multiple priorities while staying aligned with their spiritual calling.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack Query (React Query) for server state
- **UI Framework**: Radix UI primitives with shadcn/ui component system
- **Styling**: Tailwind CSS with custom design tokens

**Design System**:
- Utility-focused minimalist approach inspired by Notion
- Calm neutral palette (stone beige backgrounds, royal blue accents)
- Custom CSS variables for light/dark theme support
- Consistent spacing using Tailwind's spacing scale
- System font stack for optimal performance

**Key Design Decisions**:
- **Problem**: Need for peaceful, distraction-free interface
- **Solution**: Stone-white color scheme with minimal decorative elements
- **Rationale**: Supports mindful reflection and reduces cognitive load

### Backend Architecture

**Server Framework**: Express.js with TypeScript
- RESTful API design
- In-memory storage (development/demo mode)
- Session-based state management

**API Structure**:
- `GET /api/daily` - Fetch daily alignment data (energy level, tasks, schedule, verse)
- `PATCH /api/daily/energy` - Update user's energy level
- `PATCH /api/tasks/:id` - Update task completion status

**Data Models**:
- **User**: Basic authentication (username, password)
- **DailyAlignment**: Energy level, Big 3 tasks, time-blocked schedule, daily verse
- **WeeklyData**: Pillar tracking, focus statement, top 5 priorities
- **Task**: Title, completion status, order
- **TimeBlock**: Time range and activity description
- **Pillar**: Name, current hours, target hours

**Key Architectural Decisions**:
- **Problem**: Need for simple data persistence during development
- **Solution**: In-memory storage with interface-based design (IStorage)
- **Rationale**: Allows easy swapping to database implementation (Drizzle ORM schema already defined)
- **Future Path**: PostgreSQL with Drizzle ORM (schema defined in shared/schema.ts)

### Build System

**Development**:
- Vite for fast HMR and dev server
- tsx for TypeScript execution
- Custom middleware integration between Express and Vite

**Production**:
- esbuild for server bundling with dependency allowlisting
- Vite for client-side optimization
- Single command build process (`npm run build`)

**Key Build Decisions**:
- **Problem**: Cold start performance on deployment platforms
- **Solution**: Bundle specific dependencies to reduce syscalls
- **Allowlist**: Includes database drivers, AI clients, and heavy libraries

### External Dependencies

**UI Components**: 
- Radix UI primitives (50+ components) for accessible, unstyled components
- lucide-react for consistent iconography

**Data Fetching**:
- TanStack Query for caching and synchronization
- Custom fetch wrapper with error handling

**Validation**:
- Zod for runtime type validation
- drizzle-zod for schema-to-validator generation

**Styling**:
- Tailwind CSS with PostCSS
- class-variance-authority for component variants
- clsx + tailwind-merge for className composition

**Date Handling**:
- date-fns for formatting and manipulation

**Planned Integrations** (schema prepared but not yet implemented):
- PostgreSQL database via Drizzle ORM
- AI services (schema suggests Google Generative AI, OpenAI support)
- Session management (connect-pg-simple for PostgreSQL sessions)

**Development Tools**:
- Replit-specific plugins for error overlay and dev banner
- TypeScript with strict mode enabled
- Path aliases for clean imports (@/, @shared/)

### Key Architectural Patterns

1. **Separation of Concerns**: Shared schema between client and server via @shared module
2. **Type Safety**: End-to-end TypeScript with Zod runtime validation
3. **Progressive Enhancement**: In-memory storage with database-ready interfaces
4. **Component Composition**: Atomic design with shadcn/ui patterns
5. **Accessibility First**: Radix UI primitives ensure WCAG compliance
6. **Theme Support**: CSS variables enable seamless light/dark mode switching