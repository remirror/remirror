import { REMIRROR_IDENTIFIER_KEY, RemirrorIdentifier } from '@remirror/core-constants';
import { freeze, isIdentifierOfType, isRemirrorType, startCase } from '@remirror/core-helpers';
import { IfNoRequiredProperties } from '@remirror/core-types';

import { AnyExtension } from '../extension';
import { Preset, PresetConstructor, PresetFactoryParameter } from './preset-base';

function createPresetFactory<Settings extends object = {}, Properties extends object = {}>() {
  return {
    /**
     * Create a preset.
     */
    preset<ExtensionUnion extends AnyExtension>(
      factoryParameter: PresetFactoryParameter<ExtensionUnion, Settings, Properties>,
    ): PresetConstructor<ExtensionUnion, Settings, Properties> {
      const parameter = freeze(factoryParameter);
      const presetClassName = `${startCase(parameter.name)}Preset`;

      // This is wrapped in an object so that a readable name appears in error
      // traces for better debugging. The name is taken from the
      // `presetClassName` variable and is the only way to name a class.
      const classNameHack: Record<
        string,
        PresetConstructor<ExtensionUnion, Settings, Properties>
      > = {
        [presetClassName]: class extends Preset<ExtensionUnion, Settings, Properties> {
          /**
           * Identifies this as a `PresetConstructor`.
           *
           * @internal
           */
          static get [REMIRROR_IDENTIFIER_KEY]() {
            return RemirrorIdentifier.PresetConstructor;
          }

          public static of(...settings: IfNoRequiredProperties<Settings, [Settings?], [Settings]>) {
            // Using this to refer to itself. If you ever want to pick the off
            // method from here you would need to bind it to the constructor.
            return new this(...settings);
          }

          private constructor(
            ...settings: IfNoRequiredProperties<Settings, [Settings?], [Settings]>
          ) {
            super(...settings);
          }

          public getFactoryParameter() {
            return parameter;
          }
        },
      };

      return classNameHack[presetClassName];
    },
  };
}

/**
 * The factory for creating a new preset.
 */
export const PresetFactory = {
  /**
   * A pattern which allows you to specify the exact types for the preset
   * settings and properties. Without it, the typescript compiler would try and
   * infer them from the default props and default settings.
   */
  typed<Settings extends object, Properties extends object = {}>() {
    return createPresetFactory<Settings, Properties>();
  },
};

/**
 * Determines if the passed in value is a preset constructor (which is used to
 * create preset instances).
 */
export function isPresetConstructor<Settings extends object = any>(
  value: unknown,
): value is PresetConstructor<any, Settings, any> {
  return isRemirrorType(value) && isIdentifierOfType(value, RemirrorIdentifier.PresetConstructor);
}
