import { lazy, type ComponentType } from 'react';

/**
 * Enhanced React.lazy with automatic single-retry on transient chunk load failure.
 * Supports both default exports and named export mappings without any-types.
 */
export function lazyWithRetry<T extends ComponentType<unknown>>(
  factory: () => Promise<{ default: T } | Record<string, unknown>>,
  namedExport?: string
) {
  return lazy(async () => {
    const load = async () => {
      const module = await factory();
      if (namedExport && !('default' in module)) {
        return { default: module[namedExport] as T };
      }
      return module as { default: T };
    };

    try {
      return await load();
    } catch (error) {
      console.warn('Chunk load error, retrying import once...', error);
      return await load();
    }
  });
}
