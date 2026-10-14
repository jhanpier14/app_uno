# AGENTS.md — AppUno

> Compact instruction file for future OpenCode sessions. Every line answers:
> "Would an agent likely miss this without help?" If not, it's left out.

## Commands

| Action | Command | Notes |
|--------|---------|-------|
| Start dev server | `ng serve` | Serves at `http://localhost:4200/` |
| Build | `ng build` | Outputs to `dist/`. Prod config by default |
| Build + watch | `npm run watch` | `--watch --configuration development` |
| Run tests | `ng test` | Uses Vitest under the hood (Angular 22) |
| SSR production server | `npm run serve:ssr:app_uno` | Starts `node dist/app_uno/server/server.mjs` on port 4000 (or `PORT` env) |
| OpenAPI / API notes | N/A | No custom Express routes defined beyond SSR handling |

## Architecture & Structure

- **Monorepo**: Single-package Angular app (`package.json` `"private": true`).
- **Entry points**:
  - `src/main.ts` — client-side bootstrap via `bootstrapApplication`
  - `src/main.server.ts` — SSR bootstrap via `mergeApplicationConfig` + `provideServerRendering`
  - `src/server.ts` — Express server that serves the Angular app via `AngularNodeAppEngine` and `createNodeRequestHandler`
- **SSR**: The app is Angular SSR (Universal). `angularApp.handle(req)` renders pages. The Express server serves static `dist/browser` assets and falls back to Angular rendering.
- **Build output**: `ng build` produces `dist/app_uno/browser/`. The SSR server references `../browser` relative to `src/server.ts`.
- **Test runner**: `ng test` runs Vitest (confirmed by `tsconfig.spec.json` setting `vitest/globals`). The existing `src/app/app.spec.ts` tests the App component.
- **TypeScript**: `skipLibCheck: true`, `isolatedModules: true`, `experimentalDecorators: true`, target `ES2022`. Angular compiler options `strictInjectionParameters` and `strictInputAccessModifiers` are enabled.
- **Prettier**: Config in `.prettierrc` — `printWidth: 100`, `singleQuote: true`, angular HTML parser for `*.html` files. Run `npx prettier --write .` to format.

## Environment Quirks & Gotchas

- **SSR port**: The production server listens on port **4000** by default; override with `PORT` env variable. (`src/server.ts` line 55)
- **Package manager**: Pinned to `npm@11.19.0` (`package.json`). Use `npm` consistently; do not switch to `pnpm` or `yarn` without updating lockfile and scripts.
- **No custom API routes**: `src/server.ts` has a commented example section for Express APIs. Currently only SSR and static file serving are active. Do not add Express routes without also considering SSR interaction.
- **Angular version**: `22.2.2`. This is a very recent Angular version; APIs (signals, SSR, etc.) are the current defaults. Do not assume Karma-based testing or old Angular patterns.
- **Vitest globals**: Test files import `vitest/globals` for `describe`, `it`, `expect`. The `tsconfig.spec.json` explicitly sets this.
- **SSR render mode**: `app.routes.server.ts` sets `renderMode: RenderMode.Prerender` for the `**` catch-all route. This affects how `angularApp.handle(req)` behaves.

## Workflow Order

When making changes that involve both client and server:

1. `ng build` (or `npm run build`) — builds the browser bundle
2. `npm run serve:ssr:app_uno` — starts the SSR server using the just-built assets
3. Verify changes at `http://localhost:4200/` (dev) or `http://localhost:4000/` (SSR)

## What to Avoid

- **Do not assume Karma**: `ng test` in Angular 22 uses Vitest, not Karma. The `vitest/globals` type config in `tsconfig.spec.json` confirms this.
- **Do not confuse `dist/` and `browser/`**: `ng build` outputs to `dist/app_uno/browser/`. The SSR server (`src/server.ts`) references `../browser` from its location in `src/`.
- **Do not omit `ng test` Vitest setup**: If adding new test files, ensure `vitest/globals` is available (the `tsconfig.spec.json` already handles this).
- **Do not forget Prettier**: The repo enforces `singleQuote` and `printWidth 100`. Run prettier before committing.