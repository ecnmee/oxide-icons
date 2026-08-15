/**
 * Identifier of an icon family (e.g. "ui", "arrows").
 *
 * Value object: today it is a `string` alias, but it represents a
 * domain concept (see ADR-0004, Ubiquitous Language), not a generic
 * string.
 */
export type FamilyId = string;

/**
 * Canonical, unique identifier of an icon, always in the format
 * "family:name". Never `name` alone outside the context of an already
 * resolved family (see ADR-0002, decision "key is always family:name").
 */
export type IconId = `${string}:${string}`;

/**
 * Builds the canonical {@link IconId} from a family and a name.
 *
 * @param family the icon's family, e.g. "ui"
 * @param name the icon's name within the family, e.g. "add"
 * @returns the IconId in "family:name" format, e.g. "ui:add"
 */
export function toIconId(family: FamilyId, name: string): IconId {
  return `${family}:${name}`;
}

/**
 * Full data for a single icon, a domain entity (see ADR-0006, domain
 * typology table).
 *
 * An icon is pure data (ADR-0002, principle 2: "icons are data, not
 * code"): no logic, no methods, no behavior here.
 */
export interface IconData {
  /** Canonical identifier, always equal to `toIconId(family, name)`. */
  id: IconId;
  family: FamilyId;
  name: string;
  /** `viewBox` of the original `<svg>`, e.g. `"0 0 24 24"`. */
  viewBox: string;
  /**
   * Inner content of the `<svg>` (paths, lines, circles...), without
   * the `<svg>` tag itself. The {@link Renderer} is responsible for
   * wrapping this in the tag and applying presentation options.
   */
  body: string;
  tags?: readonly string[];
  aliases?: readonly string[];
  // See ADR-0008: tags/aliases are readonly, the domain never mutates
  // them after construction.
  // Deliberately OUT of the v2 schema: author, licence, version.
  // No real consumer today, see ADR-0001 ("Non-goals") and ADR-0002.
  // Add as optional fields the day there is a concrete use case (e.g.
  // a third-party icon pack requiring attribution).
}
