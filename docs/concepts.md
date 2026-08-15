# Icon families and isolation

This page explains the mental model behind Oxide Icons: what a family
is, and how isolation between families works. It describes the design
as decided (see ADR-0004), ahead of a working implementation. There is
no runnable `<ox-icon>` yet, see the roadmap in the main README for
current status.

## The problem in one sentence

Most applications end up mixing icons from more than one source over
time, usually by accident, and nothing catches it.

## Icons live in families

Every icon belongs to exactly one family, a named group with a shared
visual language, for example `ui` or `arrows`. An icon's full identity
is always `family:name`, for example `ui:add`. There is no such thing
as an icon with no family.

## An area of your app can declare what it expects

You mark a part of the DOM with the family it expects:

```html
<div data-icon-family="ui">
  <ox-icon name="add"></ox-icon>
</div>
```

Every `<ox-icon>` inside that area inherits `ui` as its expected
family, unless it explicitly asks for a different one.

## What happens when something does not match

That is where isolation mode comes in. Three modes, chosen per area:

- `soft` (the default): an icon from a different family is still
  rendered, but a warning is logged. Use this while you are migrating
  or exploring, when you want visibility without breaking anything.
- `exclusive`: an icon from a different family is silently not
  rendered. Use this when a mismatch should be invisible to the end
  user, not a hard failure.
- `strict`: an icon from a different family throws. Use this in areas
  where a mismatch is a bug that should fail loudly, in development and
  in tests.

```html
<div data-icon-family="finance" data-icon-isolation="strict">
  <ox-icon name="invoice"></ox-icon>                 <!-- fine -->
  <ox-icon name="hospital" family="medical"></ox-icon>  <!-- throws -->
</div>
```

## Why this is not just a lint rule

A lint rule catches this at commit time, if someone remembers to run
it, and only for icons a static analyzer can see. This is a runtime
guarantee: it holds regardless of how the icon name got there, a
prop, a CMS field, output from another system, and it holds in every
environment the app actually runs in, not only in CI.

## What this page does not cover yet

API reference for `<ox-icon>` itself, the Vite plugin, and the loader
system will be documented once they exist as working code, not before.
See the ADRs in `docs/en/adr/` for the underlying contracts if you want
the implementation-level detail today.
