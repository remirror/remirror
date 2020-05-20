import { RemirrorIdentifier } from '@remirror/core-constants';

import { PlainExtension } from '../../extension';
import { AnyPreset, Preset, SetPresetPropertiesParameter } from '../preset-base';

// @ts-expect-error
class PresetNoName extends Preset {}

// @ts-expect-error
class NoExtensionPreset extends Preset {
  public name = 'noExtensions';

  protected createDefaultSettings(): import('@remirror/core-types').FlipPartialAndRequired<{}> {
    throw new Error('Method not implemented.');
  }
  protected createDefaultProperties(): Required<{}> {
    throw new Error('Method not implemented.');
  }
  protected onSetProperties(parameter: SetPresetPropertiesParameter<{}>): void {
    throw new Error('Method not implemented.');
  }
}

class MissingSettingsPreset extends Preset<{ oops?: boolean }> {
  public name = 'missingSettings' as const;

  protected createDefaultProperties(): Required<{}> {
    throw new Error('Method not implemented.');
  }

  // @ts-expect-error
  protected createDefaultSettings() {
    return { a: '', oops: 'wrong type' };
  }

  protected onSetProperties(parameter: SetPresetPropertiesParameter<{}>): void {
    throw new Error('Method not implemented.');
  }

  public createExtensions() {
    return [];
  }
}

class ExtensionWithSettings extends PlainExtension<{ oops: boolean }> {
  public name = 'withSettings' as const;

  protected createDefaultSettings() {
    return {};
  }
  protected createDefaultProperties(): Required<{}> {
    throw new Error('Method not implemented.');
  }
}

class WithSettingsPreset extends Preset<{ me: 'friend' | 'enemy' }> {
  public name = 'withSettings' as const;

  protected createDefaultProperties(): Required<{}> {
    throw new Error('Method not implemented.');
  }

  protected createDefaultSettings() {
    return { me: 'friend' as const };
  }

  protected onSetProperties(parameter: SetPresetPropertiesParameter<{}>): void {
    throw new Error('Method not implemented.');
  }

  public createExtensions() {
    return [new ExtensionWithSettings({ oops: false })];
  }
}

// @ts-expect-error
new WithSettingsPreset();
// @ts-expect-error
new WithSettingsPreset({});

const extensionArray: Array<WithSettingsPreset['~E']> = [
  new ExtensionWithSettings({ oops: false }),
];

const anyPresetWithSettings: AnyPreset = new WithSettingsPreset({ me: 'friend' });
const temp1: RemirrorIdentifier.Preset = anyPresetWithSettings['~~remirror~~'];
// @ts-expect-error
const temp2: RemirrorIdentifier.Extension = anyPresetWithSettings['~~remirror~~'];

class WithPropertiesPreset extends Preset<{ me?: string }, { required: boolean }> {
  public name = 'withSettings' as const;

  protected createDefaultProperties() {
    return { required: true };
  }

  protected createDefaultSettings() {
    return { me: 'friend' };
  }

  protected onSetProperties(parameter: SetPresetPropertiesParameter<{}>): void {
    throw new Error('Method not implemented.');
  }

  public createExtensions() {
    return [new ExtensionWithSettings({ oops: false })];
  }
}

new WithPropertiesPreset();
new WithPropertiesPreset({ properties: { required: false } });
