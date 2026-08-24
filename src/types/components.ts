/** A component name and version used as an action input or output key. */
export type TComponentKey = `${string}:${string}`;

/** Maps component keys to the absolute paths of their definition files. */
export type TComponentMap = {
  [key: TComponentKey]: string;
};
