/** Matches supported component definition filenames. */
export const COMPONENT_FILE_NAME_REGEX = /^\.component\.ya?ml$/;

/** Matches component names with an optional version suffix. */
export const VALID_COMPONENT_REGEX = /^[a-zA-Z0-9_\-.]+(:[a-zA-Z0-9_\-.]+)?$/;

/** Absolute path to the GitHub workspace, or the current directory locally. */
export const WORKSPACE = process.env.GITHUB_WORKSPACE || process.cwd();

/** Name of the action input containing requested component names. */
export const COMPONENTS_INPUT = 'components';

/** Name of the action input containing directories to search. */
export const COMPONENT_SEARCH_DIRECTORIES_INPUT =
  'component-search-directories';
