<p align="center">
  <img src="./assets/logo.png" alt="Oxide Icons" width="160" />
</p>

<h1 align="center">Oxide Icons</h1>

<p align="center">
  <strong>An icon library that knows where it is.</strong><br />
  Native Web Component, zero dependencies, and the only icon system
  built around explicit isolation between visual icon families in the
  same application.
</p>

<p align="center">
  <strong>In active development. No published release yet.</strong>
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

## Why there's no release yet

We'd rather have a small, honest repository than a feature list that
doesn't exist yet. An earlier version of this project was abandoned
mid-refactor. Instead of publishing on top of that, we restarted with
the architecture defined and documented before the first line of
implementation. Development happens in the open, in the working
repository (link to be added here once both repositories are
published).

## What's already built

- Native Web Component (`<ox-icon>`), zero runtime dependencies.
- On-demand (JIT) loading, per icon family.
- Context and isolation system (`soft`/`exclusive`/`strict`), the
  product's core differentiator.
- Strict-mode TypeScript from the first file.
- Contract-driven architecture, documented in Architecture Decision
  Records before any implementation.
- A first, original icon set (14 icons) and a working browser example
  wiring everything end to end.

## Roadmap

- [x] Domain architecture and contracts defined and documented.
- [x] Reference implementations (`Registry`, `Catalog`, `Loader`,
      `Renderer`, context resolution).
- [x] Functional `<ox-icon>`, first example running in the browser.
- [x] Vite plugin.
- [x] First icon set published (full transparency on how many icons
      exist, no inflated numbers).
- [ ] First `0.1.0` release.

## Follow development

Code, tests, and architecture decisions live in the development
repository (link to be added here).

## License

MIT, see [LICENSE](./LICENSE).
