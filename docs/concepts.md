# How Oxide Icons thinks about icons

Most icon libraries answer one question: give me an icon. Oxide Icons
also answers a second one, that none of the popular libraries address:
should this icon even be allowed here.

## Every icon belongs to a family

Not a loose tag, a real boundary. `ui:add`, `arrows:left`,
`medical:hospital`. An icon is never just a name, it is always a name
inside a family.

## An area of your app can declare what it expects

```html
<div data-icon-family="finance" data-icon-isolation="strict">
  <ox-icon name="invoice"></ox-icon>              <!-- fine -->
  <ox-icon name="hospital" family="medical"></ox-icon>  <!-- blocked -->
</div>
```

Three isolation modes, chosen per area: `soft` warns, `exclusive`
silently blocks, `strict` throws. This is not a lint rule that catches
mistakes at commit time if someone remembers to run it. It is a
runtime guarantee, in every environment your app actually runs in.

## Why this matters

Design systems, white-label products, and multi-team codebases all
eventually mix icon sources by accident. Nothing today catches it at
the point it happens. This is the part of the problem Oxide Icons is
built around, everything else (bundle size, loading strategy, the Web
Component itself) exists to support that one guarantee well.

Full technical detail lives in the Architecture Decision Records in the
development repository.

[Ler esta página em português](./concepts.pt.md)
