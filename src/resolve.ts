import { debug, warning } from '@actions/core';
import { isAbsolute, resolve } from 'node:path';

import type { TComponentKey } from './types/components.js';
import { VALID_COMPONENT_REGEX, WORKSPACE } from './constants.js';

/**
 * Resolves relative component search directories against the GitHub workspace.
 *
 * @param {string[]} searchDirectories Directories supplied by the action input.
 * @returns {string[]} The supplied directories with relative paths made absolute.
 */
export function resolveAbsoluteSearchDirectories(
  searchDirectories: string[],
): string[] {
  const componentSearchDirectories = [...searchDirectories];

  if (componentSearchDirectories.length > 0) {
    for (let i = 0; i < componentSearchDirectories.length; i++) {
      const searchDir = componentSearchDirectories[i];

      if (!isAbsolute(searchDir)) {
        componentSearchDirectories[i] = resolve(WORKSPACE, searchDir);
      }
    }
  }

  return componentSearchDirectories;
}

/**
 * Validates component names and adds the latest version when it is omitted.
 *
 * @param {string[]} components Component names or name-and-version keys supplied by the user.
 * @returns {TComponentKey[]} Valid component keys normalized to include a version.
 */
export function resolveActualComponentNames(
  components: string[],
): TComponentKey[] {
  const newComponents: TComponentKey[] = [];

  for (const component of components) {
    if (!VALID_COMPONENT_REGEX.test(component)) {
      warning(`Invalid component name: ${component}`);

      continue;
    }

    if (component.split(':').length > 1) {
      const [name, version] = component.split(':');

      debug(`Component: ${name}, Version: ${version}`);

      newComponents.push(`${name}:${version}`);
    } else {
      debug(`Component: ${component}, Version: latest`);

      newComponents.push(`${component}:latest`);
    }
  }

  return newComponents;
}
