# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

```bash
# Development (runs src/entrypoints/cli.tsx via tsx)
npm run dev
npm run dev -- --help

# Build for production (esbuild, outputs to dist/cli.js)
npm run build

# Build with production API URL
cross-env R2_API_URL=https://api.puresnake.com npm run build

# Test CLI directly
npx tsx src/entrypoints/cli.tsx --help
```

## Architecture Overview

R2-CLI is a CLI tool for the luxury resale market (二手潮奢交易). It exposes business capabilities as CLI commands and AI Agent skills.

### Entry Flow
1. `src/entrypoints/cli.tsx` — CLI entry point, sets up Commander, registers commands
2. `src/commands/setup.ts` — Registers all domain commands (auth, business, inventory, ai, etc.)
3. Domain command factories in `src/commands/*/` each return a `Command` instance

### Service Layer
- `src/services/api/api-client.service.ts` — HTTP client using `fetch`, implements `IApiClient`. Base URL `R2_API_URL` is replaced at build time via esbuild `--define`
- `src/services/api/api-client.interface.ts` — Interfaces: `IApiClient`, `IQRCodeAuthApi`, `ApiConfig`, `ApiResponse<T>`
- `src/services/ai/alibaba.ts` — Alibaba Bailian AI service with streaming SSE. Types: `ChatMessage`, `ChatOptions`
- `src/services/ai/index.ts` — `MultiAIService` facade, exports singleton `aiService`
- `src/services/storage/index.ts` — File-based credential storage in `~/.r2-cli/config.json`

### Query Executor
- `src/query/executor.ts` — Generic AsyncGenerator-based query execution with progress events and polling. Used by auth login flow

### Auth Flow (fully implemented)
`src/commands/auth/login.ts` → `LoginService` → `executePollingQuery` → polls QR code scan status

### Build System
- `scripts/build.js` — esbuild, single entry point `cli.tsx`. Replaces `process.env.R2_API_URL` at build time. Externalizes all runtime deps
- `scripts/dev.js` — Runs `tsx src/entrypoints/cli.tsx` directly

### Key Types
- `src/types/auth.ts` — `UserInfo`, `QRCodeStatus`, `GenerateQRCodeData`, `QRCodeStatusData`
- `src/errors/index.ts` — Error hierarchy: `R2Error` → `ApiError`, `StorageError`, `AuthError`, `PollingError`, `CliError`

### Environment Variables
- `R2_API_URL` — API base URL, replaced at build time. Default: `https://api.qiuxietang.com`, production: `https://api.puresnake.com`
- `ALIBABA_API_KEY` — For Alibaba Bailian AI service (must be set via env, never hardcoded)

### tsconfig
- `module: "nodenext"`, `strict: true`, `jsx: "react-jsx"`, `verbatimModuleSyntax: true`
- All imports must use `.js` extension for ESM resolution
