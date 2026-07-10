<p align="center">
  <img src="./assets/logo.png" alt="Oxide Icons" width="160" />
</p>

<h1 align="center">Oxide Icons</h1>

<p align="center">
  <strong>An icon library that knows where it is.</strong><br />
  A native Web Component, zero dependencies, and the only icon system
  built around explicit isolation between visual families in the same
  application.
</p>

<p align="center">
  <strong>In active development. No release published yet.</strong>
</p>

<p align="center">
  <a href="./README.pt.md">Ler em português</a>
</p>

---

## The problem it solves

Every popular icon library, Lucide, Heroicons, Feather, solves "give me
an icon" well. None of them solve the problem of two icon families
coexisting in the same application without accidentally bleeding into
each other: a dashboard that uses an "outline" icon set and accidentally
inherits a "filled" icon from another dependency, or a design system
that needs a guarantee that one section of the app never mixes styles.

Oxide Icons solves this with a context and isolation system: areas of
the application declare which family they belong to, and the library
decides, predictably and configurably (`soft` / `exclusive` / `strict`),
what happens when an icon from outside shows up there.

```html
<div data-icon-family="ui" data-icon-isolation="strict">
  <ox-icon name="add"></ox-icon>   <!-- fine, family "ui" -->
  <ox-icon name="add" family="arrows"></ox-icon>  <!-- blocked -->
</div>
```

Read more: [How Oxide Icons thinks about icons](./docs/concepts.md).

## Why there is no release yet

We would rather ship a small, honest repository than a feature list
that does not exist yet. A previous version of this project was
abandoned mid-refactor. Instead of publishing on top of that, we
restarted with the architecture defined and documented before the first
line of implementation. Development happens in the open, in the
working repository (link to add here once both repositories are
published).

## What is already decided

- Native Web Component (`<ox-icon>`), zero runtime dependencies.
- On-demand (JIT) loading, per icon family.
- Context and isolation system (`soft`/`exclusive`/`strict`), the
  product's core differentiator.
- TypeScript strict mode from the very first file.
- Contract-driven architecture, documented as Architecture Decision
  Records before any implementation.

## Roadmap

- [x] Domain architecture and contracts defined and documented.
- [ ] Reference implementations (`Registry`, `Catalog`, `Loader`,
      `Renderer`, context resolution).
- [ ] A working `<ox-icon>`, first example running in the browser.
- [ ] Vite plugin.
- [ ] First published icon set (full transparency about how many
      icons exist, no inflated numbers).
- [ ] First `0.1.0` release.

## Follow the development

Source code, tests, and architecture decisions live in the development
repository (link to add here).

## License

MIT, see [LICENSE](./LICENSE).
