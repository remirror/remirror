import diff from 'jest-diff';

import {
  AnyExtensionConstructor,
  AnyPresetConstructor,
  BaseExtensionOptions,
  ErrorConstant,
  ExtensionConstructorParameter,
  invariant,
  isEqual,
  isFunction,
  isMarkExtension,
  isNodeExtension,
  mutateDefaultExtensionOptions,
  object,
  omit,
  OptionsOfConstructor,
  PresetConstructorParameter,
} from '@remirror/core';

export const initialJson = {
  type: 'doc',
  content: [
    { type: 'paragraph', content: [{ type: 'text', text: 'Better docs to come soon...' }] },
  ],
};

function emptyObject() {
  return {};
}

/**
 * Validate the shape of your extension.
 */
export function isExtensionValid<Type extends AnyExtensionConstructor>(
  Extension: Type,
  ...[options]: ExtensionConstructorParameter<OptionsOfConstructor<Type>>
) {
  const extension = new Extension(options);

  expect(extension.name).toBeString();
  expect(() => extension.setOptions({})).not.toThrow();

  if (isNodeExtension(extension)) {
    expect(
      extension.createNodeSpec({ defaults: emptyObject, dom: emptyObject, parse: emptyObject }),
    ).toBeObject();
  } else if (isMarkExtension(extension)) {
    expect(
      extension.createMarkSpec({ defaults: emptyObject, dom: emptyObject, parse: emptyObject }),
    ).toBeObject();
  }

  let defaultOptions: BaseExtensionOptions = object();

  mutateDefaultExtensionOptions((value) => {
    defaultOptions = value;
  });

  for (const key of Extension.handlerKeys) {
    invariant(isFunction(extension.options[key]), {
      message: `Invalid handler 'key'. Make sure not to overwrite the default handler`,
      code: ErrorConstant.INVALID_EXTENSION,
    });
  }

  const expectedOptions = {
    ...defaultOptions,
    ...Extension.defaultOptions,
    ...options,
  };
  invariant(isEqual(omit(extension.options, Extension.handlerKeys), expectedOptions), {
    message: `Invalid 'defaultOptions' for '${Extension.name}'\n\n${
      diff(extension.options, expectedOptions) ?? ''
    }\n`,
    code: ErrorConstant.INVALID_EXTENSION,
  });

  return true;
}

/**
 * Validate the shape of your preset.
 */
export function isPresetValid<Type extends AnyPresetConstructor>(
  Preset: Type,
  ...[options]: PresetConstructorParameter<OptionsOfConstructor<Type>>
) {
  const preset = new Preset(options);

  expect(preset.name).toBeString();
  expect(() => preset.setOptions({})).not.toThrow();

  const expectedOptions = { ...Preset.defaultOptions, ...options };

  invariant(isEqual(omit(preset.options, Preset.handlerKeys), expectedOptions), {
    message: `Invalid 'defaultOptions' for '${Preset.name}'\n\n${
      diff(preset.options, expectedOptions) ?? ''
    }\n`,
  });

  return true;
}

export { diff };

export { default as minDocument } from 'min-document';

export * from '@remirror/preset-core';
export * from '@remirror/extension-doc';
export * from '@remirror/extension-text';
export * from '@remirror/extension-paragraph';
export * from '@remirror/extension-bold';
export * from '@remirror/extension-code-block';
export * from '@remirror/extension-heading';
export * from '@remirror/extension-blockquote';
export * from '@remirror/extension-link';
export * from '@remirror/extension-italic';
export * from '@remirror/extension-underline';
export * from './object-nodes';
export * from './object-shapes';
export * from './typecheck';
