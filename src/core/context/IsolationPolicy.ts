import type {
  ContextResolution,
  ContextResolver,
  FamilyId,
  IconContext,
} from '../domain';

/**
 * Only implementation of {@link ContextResolver} in v2. Named
 * `IsolationPolicy`, not `DomContextResolver`, see ADR-0009: this is
 * pure logic, no DOM access at all, the same reasoning that led
 * `IconRegistry`'s implementation to be named plainly `Registry`
 * rather than `CoreIconRegistry`.
 *
 * Never throws, see ADR-0010: `strict` mismatches are reported as
 * `allowed: false, reason: 'strict-block'`, the same shape as
 * `exclusive`, so the caller decides what "blocked" means for each
 * mode.
 */
export class IsolationPolicy implements ContextResolver {
  resolve(iconFamily: FamilyId, context: IconContext | null): ContextResolution {
    if (context === null) {
      return {
        allowed: true,
        reason: 'no-context',
        message: null,
        effectiveFamily: iconFamily,
        mode: 'soft',
        inherited: false,
      };
    }

    if (context.family === iconFamily) {
      return {
        allowed: true,
        reason: 'match',
        message: null,
        effectiveFamily: context.family,
        mode: context.mode,
        inherited: context.inherited,
      };
    }

    return this.resolveMismatch(iconFamily, context);
  }

  private resolveMismatch(iconFamily: FamilyId, context: IconContext): ContextResolution {
    const shared = {
      effectiveFamily: context.family,
      mode: context.mode,
      inherited: context.inherited,
    };

    switch (context.mode) {
      case 'soft':
        return {
          ...shared,
          allowed: true,
          reason: 'soft-mismatch',
          message: `Icon "${iconFamily}" is being used inside a "${context.family}" context. Allowed in soft mode, but consider matching families.`,
        };

      case 'exclusive':
        return {
          ...shared,
          allowed: false,
          reason: 'exclusive-block',
          message: `Icon from family "${iconFamily}" blocked: the enclosing context requires family "${context.family}" (exclusive mode).`,
        };

      case 'strict':
        return {
          ...shared,
          allowed: false,
          reason: 'strict-block',
          message: `Icon from family "${iconFamily}" blocked: the enclosing context requires family "${context.family}" (strict mode).`,
        };
    }
  }
}
