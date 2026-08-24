import { getInput, setFailed, info, warning, setOutput } from '@actions/core';

import type { TComponentMap } from './types/components.js';
import {
  COMPONENTS_INPUT,
  COMPONENT_SEARCH_DIRECTORIES_INPUT,
} from './constants.js';

import { recursiveSearchForComponents } from './search.js';
import {
  resolveAbsoluteSearchDirectories,
  resolveActualComponentNames,
} from './resolve.js';

/**
 * The main function for the action.
 *
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const components = getInput(COMPONENTS_INPUT, { required: false })
      ?.split(',')
      .map((component) => component.trim())
      .filter((s) => s.length > 0);
    const componentSearchDirectories = getInput(
      COMPONENT_SEARCH_DIRECTORIES_INPUT,
      { required: false },
    )
      ?.split(',')
      .map((directory) => directory.trim())
      .filter((s) => s.length > 0);

    const resolvedComponents = resolveActualComponentNames(components);
    const resolvedComponentSearchDirectories = resolveAbsoluteSearchDirectories(
      componentSearchDirectories,
    );

    const prettyDirectories =
      componentSearchDirectories.length === 0
        ? 'all directories'
        : componentSearchDirectories.join(', ');

    const prettyComponents =
      components.length === 0 ? 'all components' : components.join(', ');

    info(
      `Finding components: ${prettyComponents} in directories: ${prettyDirectories}`,
    );

    if (resolvedComponentSearchDirectories.length === 0) {
      resolvedComponentSearchDirectories.push(process.cwd());
    }

    const componentMap: TComponentMap = {};

    for (const searchDir of resolvedComponentSearchDirectories) {
      Object.assign(
        componentMap,
        recursiveSearchForComponents(resolvedComponents, searchDir),
      );
    }

    const foundComponents = Object.keys(componentMap);

    for (const component of resolvedComponents) {
      if (!foundComponents.includes(component)) {
        warning(`Component ${component.split(':')[0]} not found`);
      }
    }

    setOutput('components', JSON.stringify(componentMap));
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) setFailed(error.message);
  }
}
