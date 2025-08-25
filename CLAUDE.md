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
```

### Testing Commands
```bash
pnpm test             # Run Playwright E2E tests
npx playwright test   # Run specific Playwright tests
npx playwright show-report  # View test reports
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
- `User` - User accounts with email/password
- `Chat` - Chat sessions with visibility controls
- `Message_v2` - New message format with parts and attachments
- `Document` - File storage references
- `Vote_v2` - Message voting system

**Migration Pattern:**
- Deprecated tables (Message, Vote) exist alongside new versions
- Use `Message_v2` and `Vote_v2` for new development

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
- **E2E Tests:** Full user workflows in `/tests/e2e/`
- **Route Tests:** API endpoint testing in `/tests/routes/`
- **Mock Models:** Test fixtures for AI responses
- **Page Objects:** Structured test organization

## Environment Configuration

### Required Variables
```bash
POSTGRES_URL=         # PostgreSQL connection string
AUTH_SECRET=          # NextAuth secret (use: openssl rand -base64 32)
```

### Optional Variables
```bash
XAI_API_KEY=          # xAI API key for default model
BLOB_READ_WRITE_TOKEN= # Vercel Blob for file storage
REDIS_URL=            # Redis for caching
```

## Development Workflow

### Making Changes
1. Start with `pnpm dev` for hot reloading
2. Database changes: modify `/lib/db/schema.ts` → `pnpm db:generate` → `pnpm db:migrate`
3. Run tests: `pnpm test` for full E2E coverage
4. Lint before commits: `pnpm lint:fix`

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

## Deployment Notes
- Optimized for Vercel deployment
- Build includes database migrations
- Environment variables managed via Vercel dashboard
- GitHub Actions configured for CI/CD testing