# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project context

RepairHub is a system to help small businesses organize computer and equipment maintenance services. It should support registering clients, equipment, and services performed, plus tracking the status of each service. The first version should be simple and functional, prioritizing service tracking above all else.

The project has an initial service-tracking feature in place (no separate client/equipment registration yet — those are plain string fields on a service).

## Domain model (current)

- `src/types.ts` defines the `Service` entity (`id`, `client`, `equipment`, `problem`, `serviceDone`, `status`) and `ServiceStatus`, a union of 4 states: `Recebido`, `Em análise`, `Em manutenção`, `Concluído`.
- `src/App.tsx` holds the list of services in local component state (`useState`) — no persistence layer yet, everything resets on reload.
- `src/components/ServiceForm.tsx` — form to register a new service (client, equipment, problem, service performed, status).
- `src/components/ServiceList.tsx` — renders registered services as cards, each with a status badge and a select to update its status.

## Commands

```bash
npm run dev      # start the local dev server (Vite)
npm run build    # type-check (tsc -b) then production build
npm run lint     # run ESLint over the project
npm run preview  # preview the production build locally
```

There is no test runner configured yet.

## Technical conventions

- TypeScript and functional React components only (no class components).
- Component names use PascalCase.

## Architecture notes

- Vite is the build tool (`vite.config.ts`), using `@vitejs/plugin-react`.
- TypeScript project is split via references in `tsconfig.json` into `tsconfig.app.json` (app source, `src/`) and `tsconfig.node.json` (Vite config tooling).
- ESLint config (`eslint.config.js`) uses the flat config format with `typescript-eslint`, `eslint-plugin-react-hooks`, and `eslint-plugin-react-refresh`.
- App entry point is `src/main.tsx`, rendering `src/App.tsx`.
