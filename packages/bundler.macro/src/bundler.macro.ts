/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable unicorn/import-style */

import { NodePath, transformFileSync } from '@babel/core';
import is from '@sindresorhus/is';
import { createMacro, MacroError, MacroParams } from 'babel-plugin-macros';
import makeSync from 'make-synchronous';
import { dirname } from 'path';

interface MethodProps {
  reference: NodePath;
  babel: MacroParams['babel'];
  state: MacroParams['state'];
}

interface CheckReferenceExistsParameter {
  name: string;
  method: (options: MethodProps) => void;
  macroParameter: MacroParams;
}

/**
 * Provides a custom error for this macro.
 */
class JsonMacroError extends MacroError {
  constructor(message: string) {
    super(message);
    this.name = 'JsonMacroError';
    this.stack = '';
  }
}

/**
 * Checks if a value is a string or is undefined.
 */
function isStringOrUndefined(value: unknown): value is string | undefined {
  return is.string(value) || is.undefined(value);
}

/**
 * Prints readable error messages for when loading a json file fails.
 * @param {NodePath} path
 * @param {string} message
 *
 * @returns {never}
 */
function frameError(path: NodePath, message: string): never {
  throw path.buildCodeFrameError(`\n\n${message}\n\n`, JsonMacroError);
}

interface EvaluateNodeValueProps<Type> {
  node: NodePath | undefined;
  parentPath: NodePath;
  predicate: (value: unknown) => value is Type;
}

/**
 * Evaluates the value matches the provided `predicate`.
 */
function evaluateNodeValue<Type>({
  parentPath,
  node,
  predicate,
}: EvaluateNodeValueProps<Type>): Type {
  let value: unknown;

  try {
    value = node?.evaluate().value;
  } catch {
    /* istanbul ignore next */
    frameError(
      parentPath,
      `There was a problem evaluating the value of the argument for the code: ${parentPath.getSource()}. If the value is dynamic, please make sure that its value is statically deterministic.`,
    );
  }

  if (!predicate(value)) {
    frameError(
      parentPath,
      `Invalid argument passed to function call. Received unsupported type '${is(value)}'.`,
    );
  }

  return value;
}

interface GetArgumentNodeProps {
  parentPath: NodePath;
  required?: boolean;
  index?: number;
  maxArguments?: number;
}

/**
 * Get the node for the first argument of a function call. Will throw an error
 * if more than one argument.
 */
function getArgumentNode({
  parentPath,
  required = true,
  index = 0,
  maxArguments = 1,
}: GetArgumentNodeProps): NodePath | undefined {
  const nodes = parentPath.get('arguments');
  const nodeArray = Array.isArray(nodes) ? nodes : [nodes];

  if (nodeArray.length > maxArguments) {
    frameError(
      parentPath,
      `Too many arguments provided to the function call: ${parentPath.getSource()}. This method only supports one or less.`,
    );
  }

  const node = nodeArray?.[index];

  if (node === undefined && required) {
    frameError(
      parentPath,
      `No arguments were provided when one is required: ${parentPath.getSource()}.`,
    );
  }

  return node;
}

/**
 * @param {any} state
 *
 * @returns {string}
 */
function getFileName(state: any): string {
  const fileName = state.file.opts.filename;

  if (!fileName) {
    throw new JsonMacroError(
      'json.macro methods can only be used on files and no filename was found',
    );
  }

  return fileName;
}

interface ReplaceParentExpressionProps {
  value: string;
  babel: MacroParams['babel'];
  parentPath: NodePath;
}

/**
 * Replace the parent expresion with the string value from the bundled file.
 */
function replaceParentExpression(options: ReplaceParentExpressionProps) {
  const { babel, parentPath, value } = options;

  parentPath.replaceWith(babel.types.stringLiteral(value));
}

/**
 * Handles loading a single json file with an optional object path parameter.
 */
function transpile({ reference, state, babel }: MethodProps) {
  const filename = getFileName(state);

  const { parentPath } = reference;
  const dir = dirname(filename);

  const rawFilePath = evaluateNodeValue({
    node: getArgumentNode({
      parentPath,
      required: true,
      maxArguments: 2,
      index: 0,
    }),
    parentPath,
    predicate: is.string,
  });

  let filePath: string;

  try {
    filePath = require.resolve(rawFilePath, { paths: [dir] });
  } catch {
    frameError(parentPath, `The provided path: '${rawFilePath}' does not exist`);
  }

  const result = transformFileSync(filePath, { cwd: dirname(filePath) });

  if (!result?.code) {
    frameError(parentPath, `The filePath: '${filePath}' could not be processed`);
  }

  replaceParentExpression({ babel, parentPath, value: result.code });
}

function bundle({ reference, state, babel }: MethodProps) {
  const filename = getFileName(state);

  const { parentPath } = reference;
  const dir = dirname(filename);

  const rawFilePath = evaluateNodeValue({
    node: getArgumentNode({
      parentPath,
      required: true,
      maxArguments: 2,
      index: 0,
    }),
    parentPath,
    predicate: is.string,
  });

  const name = evaluateNodeValue({
    node: getArgumentNode({
      parentPath,
      required: false,
      maxArguments: 2,
      index: 1,
    }),
    parentPath,
    predicate: isStringOrUndefined,
  });

  let input: string;

  try {
    input = require.resolve(rawFilePath, { paths: [dir] });
  } catch {
    frameError(parentPath, `The provided path: '${rawFilePath}' does not exist`);
  }

  interface Rollup {
    input: string;
    cwd: string;
    name: string | undefined;
  }

  const rollup = makeSync(async (props: Rollup) => {
    const { rollup } = require('rollup');
    const { babel } = require('@rollup/plugin-babel');
    const json = require('@rollup/plugin-json');
    const resolve = require('@rollup/plugin-node-resolve').default;

    const extensions = ['.js', '.jsx', '.ts', '.tsx'] as const;
    const { cwd, input, name } = props;

    const bundler = await rollup({
      input,
      plugins: [
        babel({ cwd }),
        json({ namedExports: false }),
        resolve({
          extensions,
          browser: true,
        }),
      ],
    });

    const result = await bundler.generate({ format: 'iife', name });

    return result.output[0].code;
  });

  const value = rollup({ cwd: dirname(input), input, name });
  replaceParentExpression({
    babel,
    parentPath,
    value,
  });
}

/**
 * Check to see if the provided reference name is used in this file. When it's
 * available call the function for every occurrence.
 */
function checkReferenceExists(options: CheckReferenceExistsParameter): void {
  const { method, name, macroParameter } = options;
  const { babel, references, state } = macroParameter;
  const namedReferences = references[name];

  if (!namedReferences) {
    return;
  }

  for (const reference of namedReferences) {
    const { parentPath } = reference;

    if (!parentPath.isCallExpression()) {
      throw frameError(
        parentPath,
        `'${name}' called from 'json.macro' must be used as a function call.`,
      );
    }

    method({ babel, reference, state });
  }
}

/** The supported methods for this macro */
const supportedMethods = [
  { name: 'bundle', method: bundle },
  { name: 'transpile', method: transpile },
];

/**
 * The macro which is created and exported for usage in your project.
 */
export default createMacro((macroParameter) => {
  for (const supportedMethod of supportedMethods) {
    const { name, method } = supportedMethod;
    checkReferenceExists({ name, method, macroParameter });
  }
});
