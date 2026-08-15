# Icon design language

Not a contract, not an ADR, this documents the visual rules the first
icon set follows, so new icons stay consistent instead of each looking
like it came from a different library.

## Grid and stroke

24x24 viewBox. Stroke-based, outline style: no `fill`, no `stroke`
baked into icon bodies, both come from `RenderOptions` at render time
(`SvgIconRenderer`, ADR-0002). Round caps and joins, also applied by
the renderer, never per-icon.

## The family signature, what makes this not a clone of an existing set

Two deliberate, consistently-applied choices, chosen precisely because
they are not the default choice in the icon sets most people know
(Feather, Heroicons, Lucide):

1. **Open chevron arrowheads**, a plain `V` (`polyline`), never a
   closed filled triangle, on every directional icon (`chevron-down`,
   `chevron-right`, all four `arrows/*`). Consistent across the whole
   set, not a one-off.
2. **Straight lines and polylines first.** Curves and arcs are avoided
   unless a shape genuinely requires one (`search`'s circle is the
   only arc in the current set). This was also a direct fix during
   design: an early `edit` icon used an SVG arc with a radius smaller
   than the distance it needed to span, which SVG silently auto-scales
   in a way that is hard to predict without rendering it, replaced
   with a plain closed `polyline`, both simpler and safer.

## What is deliberately generic, and why that is fine

`add`, `remove`, `close`, `check`, `menu` are close to the simplest
possible geometric construction for what they represent (two
perpendicular lines, three horizontal lines, and so on). Every icon
set draws these close to identically because the shape is a functional
necessity at small sizes, not a creative expression. Distinctiveness
for this set comes from the signature above, applied consistently,
not from making universally-recognized glyphs unrecognizable on
purpose.

## Verifying a new icon before committing it

Every icon in this set was rendered with the project's own
`SvgIconRenderer` (not hand-verified coordinates) and visually
inspected as a rasterized contact sheet before being committed, not
just written and assumed correct. Do the same for new additions.
