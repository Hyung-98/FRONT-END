# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Next.js 14-based frontend development blog using the App Router. The application serves Korean-language programming tutorials and interview questions, with content stored in Supabase and rendered using React Markdown.

## Development Commands

```bash
# Development
npm run dev              # Start dev server at localhost:3000
npm run build           # Production build
npm start               # Start production server

# Code Quality
npm run lint            # Run ESLint

# Testing
npm test                # Run all tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Generate coverage report

# Database
npm run migrate         # Run Supabase migration script
```

## Architecture

### Tech Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Styled Components with custom theme system
- **Database**: Supabase PostgreSQL
- **Content**: Markdown rendered via react-markdown with remark-gfm

### Key Architectural Patterns

**Supabase Client Setup**
- `lib/supabase/client.ts`: Client-side Supabase client using anonymous key
- `lib/supabase/server.ts`: Server-side admin client with service role key (bypasses RLS)
- `lib/supabase/posts.ts`: Data access layer with typed functions for posts
- `lib/supabase/types.ts`: Database schema types generated from Supabase

**Styled Components SSR**
The app uses a custom registry pattern for Styled Components SSR:
- `app/registry.tsx`: Handles SSR style injection and theme provider
- Includes a workaround to clean href attributes (removes whitespace)
- Theme is defined in `styles/theme.ts` with TypeScript const assertion
- Global theme access via `${props => props.theme.colors.gray900}` syntax

**Route Structure**
```
/                           # Home page with post list
/detail/[slug]              # Individual post pages (SSG)
/admin/posts/new            # Create new post
/admin/posts/edit/[slug]    # Edit existing post
/api/rest/posts             # GET (all/filtered) and POST
/api/rest/posts/[slug]      # GET single post
```

**Data Flow**
1. Pages use server components by default
2. Database queries happen via `lib/supabase/posts.ts` functions
3. API routes use `supabaseAdmin` for write operations (bypasses RLS)
4. Client reads use regular `supabase` client
5. Static generation via `generateStaticParams` using `getAllSlugs()`

### Important File Mappings

**Database Schema**
- DB columns use snake_case: `reading_time`, `hero_image`, `created_at`
- Application uses camelCase: `readingTime`, `heroImage`
- Mapping happens in `lib/supabase/posts.ts` transformation functions

**Category System**
- Categories defined in theme: `javascript`, `react`, `typescript`
- Each has associated color in `theme.colors.category`
- Used for tag styling and filtering

## Environment Variables

Required in `.env.local`:
```
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

The service role key is only used server-side for admin operations.

## Testing

- Jest configured with Next.js preset
- Test files: `**/__tests__/**/*.[jt]s?(x)` or `**/*.(spec|test).[jt]s?(x)`
- Module alias `@/*` maps to project root
- Coverage collected from `lib/`, `app/`, and `components/` directories

## Code Style Notes

- Path aliases: Use `@/` for imports from project root
- Korean language used in UI strings and content
- Date format: 'MMMM D, YYYY' uppercase (e.g., 'JANUARY 20, 2026')
- Reading time format: 'N Min' (e.g., '10 Min')
- Images from Unsplash are allowed via Next.js image config

## Migration Context

This project was migrated from vanilla JavaScript to Next.js + React with Supabase integration (see commit a34084e). The `scripts/migrate-to-supabase.ts` script was used for data migration. Legacy static files may exist in `web/` directory for reference.
