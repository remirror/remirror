/**
 * @typedef {(explicitModuleAnnotation: string, implicitFromDirectory: string, path: string, reflection: Reflection,context: Context) => string} CustomModuleNameMappingFn
 */

const unscopedRegex = /packages\/([^@\/]+)\//;
const scopedRegex = /packages\/(@remirror\/[^\/]+)/;

/**
 * @type CustomModuleNameMappingFn
 */
const customMappingFunction = (_, __, path) => {
  const unscoped = path.match(unscopedRegex)?.[1];
  const scoped = path.match(scopedRegex)?.[1];

  return unscoped ?? scoped;
};

module.exports = customMappingFunction;
