# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project context

TechControl is a system to help small businesses organize computer and equipment maintenance services. It should support registering clients, equipment, and services performed, plus tracking the status of each service. The first version should be simple and functional, prioritizing service tracking above all else.

The project is a fresh Vite + React + TypeScript scaffold — no domain code (clients, equipment, services) exists yet. `src/App.tsx` still contains the default Vite template markup.

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
