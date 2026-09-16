# Shell & Fuze Concept Simulator

A standalone, configuration-driven conceptual simulator for shell trajectory guidance
and smart fuze demonstration. Built with React, TypeScript, and Vite.

This is an academic/engineering demonstration tool — it uses a generic, normalized
physics model and does **not** implement real firing tables, real weapon dimensions,
real fuze arming/detonation logic, or any operational targeting data.

**Live demo:** https://akhilkncet.github.io/Artillery/

## Workflow

```
CONFIGURE  →  SIMULATION  →  RESULTS
```

1. **Configure** — set up a scenario, navigation concept, control/actuation method,
   fuze concept, environment, and simulation settings.
2. **Generate Simulation** — a physics-based engine computes a full trajectory,
   deviation profile, and event markers from that exact configuration.
3. **Simulation** — watch the generated trajectory animate, with pause/resume/replay
   controls.
4. **Results** — view calculated metrics (final deviation, peak deviation, correction
   effect, navigation state), a deviation-over-time graph, and dynamically generated
   observations — all derived from the same simulation run, never hardcoded.

See [docs/CONFIGURATION.md](docs/CONFIGURATION.md) for a full reference of every
configuration option, the field it maps to, and exactly how it affects the
simulation engine.

## Tech stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite 6](https://vitejs.dev/) for dev server and bundling
- [Tailwind CSS 4](https://tailwindcss.com/) for styling
- [lucide-react](https://lucide.dev/) for icons

No backend — the entire app, including the simulation engine, runs client-side.
Configuration can be saved/loaded via the browser's `localStorage`.

## Project structure

```
src/
  components/
    layout/          Header, Footer
    shell/           Shell/fuze illustration
  pages/
    Configure/       Configuration screen
    Simulation/       Trajectory animation screen
    Results/         Metrics, graph, observations
  simulation/
    engine/          SimulationEngine interface + LocalSimulationEngine implementation
  state/
    SimulationContext.tsx   Centralized configuration/result state
  types/
    simulation.ts    Shared type definitions
  utils/
    seededRandom.ts  Deterministic PRNG used by the simulation engine
  validation/
    configurationValidation.ts
docs/
  CONFIGURATION.md   Full configuration reference
```

## Getting started

```bash
npm install
npm run dev       # start the dev server (http://localhost:3000)
npm run build      # production build to dist/
npm run preview    # preview the production build locally
npm run lint       # type-check with tsc --noEmit
```

## Deployment

Pushing to `main` triggers [.github/workflows/deploy.yml](.github/workflows/deploy.yml),
which builds the app and deploys it to GitHub Pages automatically (requires
**Settings → Pages → Source: GitHub Actions** to be enabled once on the repo).
