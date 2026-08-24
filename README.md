<p align="center">
  <img src="./assets/logo.png" alt="Oxide Icons" width="160" />
</p>

<h1 align="center">Oxide Icons</h1>

<p align="center">
  <strong>An icon library that knows where it is.</strong><br />
  Native Web Component, zero dependencies, and the only icon system
  built around explicit isolation between visual icon families in the
  same application. Stop debugging why the wrong icon style leaked
  into a section of your app that was never supposed to see it.
</p>

<p align="center">
  <strong>Phase 2 of 4: building the icon catalog.</strong>
  Architecture and runtime are done. See <a href="#development-phases">phases</a> below.
</p>

<p align="center">
  <a href="./README.pt.md">Ler em Português</a>
</p>

---

## The problem it solves

Every popular icon library, Lucide, Heroicons, Feather, solves "give
me an icon" well. None of them solve the problem of two icon families
coexisting in the same application without bleeding into each other by
accident: a dashboard using an "outline" icon set that accidentally
inherits a "filled" icon from another dependency, or a design system
that needs to guarantee a section of the app never mixes styles.

Oxide Icons solves this with a context and isolation system: zones of
the application declare which family they belong to, and the library
decides, predictably and configurably (`soft` / `exclusive` /
`strict`), what happens when an icon from outside shows up there.

```html
<div data-icon-family="ui" data-icon-isolation="strict">
  <ox-icon name="add"></ox-icon>                 <!-- ok, "ui" family -->
  <ox-icon name="add" family="arrows"></ox-icon> <!-- blocked -->
</div>
```

Read more: [How Oxide Icons thinks about icons](./docs/concepts.md).

## What's already built

- Native Web Component (`<ox-icon>`), zero runtime dependencies.
- On-demand (JIT) loading, per icon family.
- Context and isolation system (`soft`/`exclusive`/`strict`).
- Strict-mode TypeScript from the first file.
- Contract-driven architecture, documented in Architecture Decision
  Records before any implementation.
- 34 icons across four families (`ui`, `arrows`, `actions`,
  `navigation`) and a working browser example wiring everything end
  to end.

## Development phases

The package is already published and usable. The project is still in
active development, with four phases covering the catalogue, documentation,
and future releases:

1. **Architecture and runtime**: done. Domain contracts, the
   isolation system, `<ox-icon>`, the Vite plugin, all built against
   real tests, not sketched.
2. **Icon catalog**: in progress. Built so far: `UI Essentials`,
   `Actions`, `Navigation` (34 icons). Still ahead: `Files & Folders`,
   `Communication`, `Media`, `Devices`, `Commerce`, `Security`,
   `Weather`, and `Brands` if it makes the cut. Coverage, not a
   count, is the finish line, see the note below.
3. **Getting Started, written against the real package**: the guide is
   being built around the package that is already available.
4. **Release and iteration**: continue improving the catalogue,
   documentation, tests, and package releases.

We're not chasing "5000 icons" as a launch number. A useful, coherent
set beats an arbitrary one, what differentiates this project is the
architecture, not the catalog size.

## Current status

Oxide Icons is already published and can be installed and used in a
project. The package is still evolving, so the current release should be
seen as an early version rather than a finished catalogue.

An earlier version of the project was abandoned during a refactor. Instead
of continuing from that codebase, we restarted with the architecture
defined and documented before implementation. The current package is the
result of that restart and is already being used in a test project.

## Follow development

Code, tests, and architecture decisions live in the development
repository.

## License

MIT, see [LICENSE](./LICENSE).
