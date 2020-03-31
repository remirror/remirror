import { REMIRROR_IDENTIFIER_KEY, RemirrorIdentifier } from '@remirror/core-constants';
import { freeze, isIdentifierOfType, isRemirrorType } from '@remirror/core-helpers';
import { IfNoRequiredProperties } from '@remirror/core-types';

import { AnyExtension } from '../extension';
import { Preset, PresetConstructor, PresetFactoryParameter } from './preset-base';

const createPresetFactory = <Settings extends object = {}, Properties extends object = {}>() => ({
  /**
   * Create a preset.
   */
  preset<ExtensionUnion extends AnyExtension>(
    factoryParameter: PresetFactoryParameter<ExtensionUnion, Settings, Properties>,
  ): PresetConstructor<ExtensionUnion, Settings, Properties> {
    const parameter = freeze(factoryParameter);

    class EditorPresetConstructor extends Preset<ExtensionUnion, Settings, Properties> {
      /**
       * Identifies this as a `PresetConstructor`.
       *
       * @internal
       */
      static get [REMIRROR_IDENTIFIER_KEY]() {
        return RemirrorIdentifier.PresetConstructor;
      }

      public static of(...settings: IfNoRequiredProperties<Settings, [Settings?], [Settings]>) {
        return new EditorPresetConstructor(...settings);
      }

      private constructor(...settings: IfNoRequiredProperties<Settings, [Settings?], [Settings]>) {
        super(...settings);
      }

      public getFactoryParameter() {
        return parameter;
      }
    }

    return EditorPresetConstructor;
  },
});

/**
 * The factory for creating a new preset.
 */
export const PresetFactory = {
  ...createPresetFactory(),

  /**
   * A pattern which allows you to specify the exact types for the preset
   * settings and properties. Without it, the typescript compiler would try and
   * infer them from the default props and default settings.
   */
  typed<Settings extends object, Properties extends object = {}>() {
    return createPresetFactory<Settings, Properties>();
  },
};

export const isPresetConstructor = <Settings extends object = any>(
  value: unknown,
): value is PresetConstructor<any, Settings, any> =>
  isRemirrorType(value) && isIdentifierOfType(value, RemirrorIdentifier.PresetConstructor);
