import { parse as yaml } from 'yaml';
import { join, resolve } from 'node:path';
import { existsSync, readdirSync, statSync, readFileSync } from 'node:fs';

import { warning, debug } from '@actions/core';

import { COMPONENT_FILE_NAME_REGEX } from './constants.js';
import type { TComponentKey, TComponentMap } from './types/components.js';

/**
 * Recursively finds component definition files beneath a directory.
 *
 * @param {TComponentKey[]} components Component keys to find, or an empty list to find all components.
 * @param {string} dir Directory in which to begin the search.
 * @returns {TComponentMap} A map of component keys to absolute definition-file paths.
 */
export function recursiveSearchForComponents(
  components: TComponentKey[],
  dir: string,
): TComponentMap {
  if (!existsSync(dir)) {
    warning(`Directory ${dir} does not exist`);

    return {};
  }

  const files = readdirSync(dir);

  const componentMap: TComponentMap = {};

  for (const file of files) {
    const filePath = join(dir, file);
    const stat = statSync(filePath);

    debug(`Checking file: ${filePath}`);

    if (stat.isDirectory()) {
      Object.assign(
        componentMap,
        recursiveSearchForComponents(components, filePath),
      );

      continue;
    }

    if (!COMPONENT_FILE_NAME_REGEX.test(file)) {
      continue;
    }

    const componentConfig = readFileSync(filePath, 'utf8');
    const component = yaml(componentConfig).component;

    if (!component) {
      // Skip files that don't have a component field

      continue;
    }

    debug(`Found component: ${component}`);

    if (components.length === 0) {
      componentMap[`${component}:latest`] = resolve(filePath);

      continue;
    }

    for (const neededComponent of components) {
      const [neededComponentName] = neededComponent.split(':');

      if (neededComponentName === component) {
        componentMap[neededComponent] = resolve(filePath);

        debug(`Found needed component: ${neededComponent} at ${filePath}`);
      }
    }
  }

  return componentMap;
}
