# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Essential Commands
```bash
pnpm install          # Install dependencies
pnpm dev              # Start development server (localhost:3000)
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run linting
pnpm lint:fix         # Fix linting issues automatically
pnpm format           # Format code with Biome
```

### Database Commands
```bash
pnpm db:generate      # Generate Drizzle migrations
pnpm db:migrate       # Run database migrations
pnpm db:push          # Push schema changes directly
pnpm db:studio        # Open Drizzle Studio
pnpm db:pull          # Pull schema from database
pnpm db:check         # Check migration consistency
pnpm db:up            # Apply pending migrations
```

### Testing Commands
```bash
pnpm test             # Run Playwright E2E tests
npx playwright test   # Run specific Playwright tests
npx playwright show-report  # View test reports
npx playwright install     # Install Playwright browsers
```

## Architecture Overview

### Core Structure
- **Next.js 15** with App Router and Turbo
- **PostgreSQL** with Drizzle ORM for data persistence
- **NextAuth.js** for authentication (credentials + guest mode)
- **AI SDK** for chat functionality with multiple model providers
- **TypeScript** with strict configuration

### Key Directories
- `/app/(chat)/` - Main chat interface and API routes
- `/app/(auth)/` - Authentication pages and configuration
- `/lib/db/` - Database schema, queries, and migrations
- `/components/` - Reusable UI components
- `/tests/` - E2E and route testing with Playwright

### Authentication System
- Supports both **registered users** (email/password) and **guest users**
- Guest users are auto-created for immediate access
- Session management via NextAuth JWT tokens
- User types: 'regular' | 'guest'

### Database Schema
**Core Tables:**
- `User` - User accounts with email/password (supports guest users with no password)
- `Chat` - Chat sessions with visibility controls (public/private)
- `Message_v2` - New message format with parts and attachments
- `Document` - File storage references with artifact support (text, code, image, sheet)
- `Vote_v2` - Message voting system with upvote/downvote
- `Suggestion` - Document collaboration with suggestion tracking
- `Stream` - Chat streaming session management
- `Lesson` - Educational content with module organization

**Migration Pattern:**
- Deprecated tables (Message, Vote) exist alongside new versions
- Use `Message_v2` and `Vote_v2` for new development
- Schema uses composite primary keys for versioned documents

### Error Handling
- Custom `ChatSDKError` class with typed error codes
- Surface-based error categorization (chat, auth, api, database)
- Visibility controls: response, log, none
- Centralized error message management in `/lib/errors.ts`

### AI Integration
- Multi-provider support (xAI default, OpenAI, Anthropic, etc.)
- Streaming responses with tool calling capabilities
- Message parts system for rich content (text, code, images)
- Document collaboration features

### Testing Strategy
- **E2E Tests:** Full user workflows in `/tests/e2e/` with authenticated user contexts
- **Route Tests:** API endpoint testing in `/tests/routes/`
- **Test Fixtures:** Named user contexts (ada, babbage, curie) with different models
- **Page Objects:** Structured test organization in `/tests/pages/`
- **Mock Support:** Test prompts and utilities for AI response simulation
- **Parallel Execution:** Tests run with 8 workers locally, 2 on CI

## Environment Configuration

### Required Variables
```bash
POSTGRES_URL=         # PostgreSQL connection string
AUTH_SECRET=          # NextAuth secret (use: openssl rand -base64 32)
```

### Optional Variables
```bash
XAI_API_KEY=          # xAI API key for default model (grok-2-1212)
BLOB_READ_WRITE_TOKEN= # Vercel Blob for file storage
REDIS_URL=            # Redis for caching
LESSONS_WEBHOOK_URL=  # Configurable webhook endpoint for lessons
```

## Development Workflow

### Making Changes
1. Start with `pnpm dev` for hot reloading (Next.js with Turbo)
2. Database changes: modify `/lib/db/schema.ts` → `pnpm db:generate` → `pnpm db:migrate`
3. Run tests: `pnpm test` for full E2E coverage (includes webserver startup)
4. Lint and format: `pnpm lint:fix` and `pnpm format` before commits

### Common Issues
- **API Route 500 errors:** Check for missing return statements in route handlers
- **Database connection:** Verify POSTGRES_URL in `.env.local`
- **Missing dependencies:** Install with `pnpm install <package>`
- **Playwright browser issues:** Run `npx playwright install`

### Code Patterns
- Use `server-only` imports for server-side code
- Implement proper error boundaries with `ChatSDKError`
- Follow existing component patterns with shadcn/ui
- Use TypeScript strict mode - all functions must be typed
- Utilize Biome for linting and formatting instead of ESLint/Prettier
- Follow message parts pattern for rich content in `Message_v2`

## Logging System
- **Winston** with daily rotation for comprehensive logging
- Structured logging with JSON format for production
- Log categories: error, warn, info, http, debug
- Helper functions in `/lib/logger.ts`:
  - `logRequest()`, `logResponse()` - HTTP middleware logging
  - `logError()` - Error tracking with stack traces
  - `logChatEvent()`, `logAuthEvent()`, `logDatabaseEvent()` - Domain-specific logging
- Log files stored in `/logs/` directory with automatic rotation (14d general, 30d errors)

## OpenTelemetry Integration
- OTel infrastructure configured via `instrumentation.ts`
- Ready for distributed tracing and metrics
- Use existing `@opentelemetry/api` for custom spans

## MCP Integration
- MCP (Model Context Protocol) configured via `.mcp.json`
- Available servers: browsermcp, supabase, @21st-dev/magic, shadcn-ui-mcp-server
- Used for extending Claude Code capabilities with external tools
- Supabase server configured for read-only access with project ref
- 21st-dev/magic for UI component generation and inspiration

## Deployment Notes
- Optimized for Vercel deployment
- Build includes database migrations (see `build` script in package.json)
- Environment variables managed via Vercel dashboard
- GitHub Actions configured for CI/CD testing

## Artifacts System
- Supports multiple artifact types: text, code, image, sheet
- Document versioning with composite primary keys (id + createdAt)
- Suggestions system for collaborative document editing
- Code editor with CodeMirror integration (JavaScript/Python support)
- ProseMirror-based rich text editing for text artifacts
- React Data Grid for sheet/spreadsheet functionality

## Key File Locations
- **API Routes:** `/app/(chat)/api/` and `/app/api/`
- **Database:** `/lib/db/schema.ts` (main schema), `/lib/db/queries.ts` (query helpers)
- **AI Integration:** `/lib/ai/` (models, providers, tools, prompts)
- **Error Handling:** `/lib/errors.ts` (ChatSDKError class and message mapping)
- **Authentication:** `/app/(auth)/auth.ts` and `/app/(auth)/auth.config.ts`
- **Logging:** `/lib/logger.ts` with middleware in `/lib/middleware/logging.ts`
- **Testing:** `/tests/` with fixtures, helpers, and page objects