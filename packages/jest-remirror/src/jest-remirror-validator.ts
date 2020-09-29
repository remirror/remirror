import {
  AnyExtensionConstructor,
  AnyPresetConstructor,
  BaseExtensionOptions,
  ExtensionConstructorParameter,
  fromHtml,
  isEmptyArray,
  isFunction,
  isMarkExtension,
  isMarkType,
  isNodeExtension,
  isNodeType,
  isPlainObject,
  mutateDefaultExtensionOptions,
  object,
  omit,
  OptionsOfConstructor,
  pick,
  PresetConstructorParameter,
} from '@remirror/core';

import { renderEditor } from './jest-remirror-editor';

/**
 * Test that your extension is valid.
 */
export function extensionValidityTest<Type extends AnyExtensionConstructor>(
  Extension: Type,
  ...[options]: ExtensionConstructorParameter<OptionsOfConstructor<Type>>
): void {
  describe(`\`${Extension.name}\``, () => {
    it(`has the right properties`, () => {
      expect(Extension.name.endsWith('Extension')).toBe(true);

      const extension = new Extension(options);
      expect(extension.name).toBe(Extension.instanceName);

      expect(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        extension.name = '_CHANGE_';
      }).toThrow();
    });

    it('can safely set empty options', () => {
      const extension = new Extension(options);
      expect(() => extension.setOptions({})).not.toThrow();
    });

    it('can safely be cloned', () => {
      const extension = new Extension(options);
      const dynamicKeys = [...extension.dynamicKeys, ...Extension.staticKeys];
      const clonedExtension = extension.clone(options);
      expect(pick(clonedExtension.options, dynamicKeys)).toEqual(
        pick(extension.options, dynamicKeys),
      );
    });

    let defaultOptions: BaseExtensionOptions = object();
    mutateDefaultExtensionOptions((value) => {
      defaultOptions = value;
    });

    const handlerKeys = Extension.handlerKeys.map((key) => [key]);

    if (!isEmptyArray(handlerKeys)) {
      it.each(handlerKeys)('has valid handlerKey: %s', (handlerKey) => {
        const extension = new Extension(options);
        expect(isFunction(extension.options[handlerKey])).toBe(true);
      });
    }

    it('has the correct options', () => {
      const extension = new Extension(options);
      const expectedOptions = {
        ...defaultOptions,
        ...Extension.defaultOptions,
        ...options,
      };

      expect(omit(extension.options, Extension.handlerKeys)).toEqual(expectedOptions);
    });

    const extension = new Extension(options);

    if (isNodeExtension(extension)) {
      it('creates a valid node spec', () => {
        const extraAttributes = {
          defaults: jest.fn(() => ({})),
          dom: jest.fn(() => ({})),
          parse: jest.fn(() => ({})),
        };

        const spec = extension.createNodeSpec(extraAttributes);
        expect(isPlainObject(spec)).toBe(true);

        renderEditor([extension], { props: { stringHandler: fromHtml, initialContent: '' } });
        expect(isNodeType(extension.type)).toBe(true);

        if (Extension.disableExtraAttributes) {
          return;
        }

        expect(extraAttributes.defaults).toHaveBeenCalled();
      });
    }

    if (isMarkExtension(extension)) {
      it('creates a valid mark spec', () => {
        const extraAttributes = {
          defaults: jest.fn(() => ({})),
          dom: jest.fn(() => ({})),
          parse: jest.fn(() => ({})),
        };

        const spec = extension.createMarkSpec(extraAttributes);
        expect(isPlainObject(spec)).toBe(true);

        renderEditor([extension], { props: { stringHandler: fromHtml, initialContent: '' } });
        expect(isMarkType(extension.type)).toBe(true);

        if (Extension.disableExtraAttributes) {
          return;
        }

        expect(extraAttributes.defaults).toHaveBeenCalled();
      });
    }
  });
}

/**
 * Test that your `Preset` is valid.
 */
export function presetValidityTest<Type extends AnyPresetConstructor>(
  Preset: Type,
  ...[options]: PresetConstructorParameter<OptionsOfConstructor<Type>>
): void {
  describe(`\`${Preset.name}\``, () => {
    it(`has the right properties`, () => {
      expect(Preset.name.endsWith('Preset')).toBe(true);

      const preset = new Preset(options);
      expect(preset.name).toBe(Preset.instanceName);

      expect(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        preset.name = 'change';
      }).toThrow();
    });

    it('can safely set empty options', () => {
      const preset = new Preset(options);
      expect(() => preset.setOptions({})).not.toThrow();
    });

    it('can safely be cloned', () => {
      const preset = new Preset(options);
      const keys = [...preset.dynamicKeys, ...Preset.staticKeys];
      const clonedPreset = preset.clone(options);
      expect(pick(clonedPreset.options, keys)).toEqual(pick(preset.options, keys));
    });

    const handlerKeys = Preset.handlerKeys.map((key) => [key]);

    if (!isEmptyArray(handlerKeys)) {
      it.each(handlerKeys)('has valid handlerKey: %s', (handlerKey) => {
        const preset = new Preset(options);
        expect(isFunction(preset.options[handlerKey])).toBe(true);
      });
    }

    it('has the correct options', () => {
      const preset = new Preset(options);
      const expectedOptions = {
        ...Preset.defaultOptions,
        ...options,
      };

      expect(omit(preset.options, Preset.handlerKeys)).toEqual(expectedOptions);
    });
  });
}
