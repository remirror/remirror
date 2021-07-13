import {
  AnyExtensionConstructor,
  BaseExtensionOptions,
  ExtensionConstructorProps,
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
} from '@remirror/core';

import { renderEditor } from './jest-remirror-editor';

/**
 * Test that your extension is valid.
 */
export function extensionValidityTest<Type extends AnyExtensionConstructor>(
  Extension: Type,
  ...[options]: ExtensionConstructorProps<OptionsOfConstructor<Type>>
): void {
  describe(`\`${Extension.name}\``, () => {
    it(`has the right properties`, () => {
      expect(Extension.name.endsWith('Extension')).toBe(true);

      const extension = new Extension(options);
      expect(extension.constructorName).toBe(Extension.name);

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

        const spec = extension.createNodeSpec(extraAttributes, {});
        expect(isPlainObject(spec)).toBe(true);

        renderEditor([extension], {
          props: { initialContent: '' },
          stringHandler: 'html',
        });
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

        const spec = extension.createMarkSpec(extraAttributes, {});
        expect(isPlainObject(spec)).toBe(true);

        renderEditor([extension], {
          props: { initialContent: '' },
          stringHandler: 'html',
        });
        expect(isMarkType(extension.type)).toBe(true);

        if (Extension.disableExtraAttributes) {
          return;
        }

        expect(extraAttributes.defaults).toHaveBeenCalled();
      });
    }
  });
}
