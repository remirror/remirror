import { RemirrorIdentifier } from '@remirror/core-constants';
import { ignoreUnused } from '@remirror/test-fixtures';

import { PlainExtension } from '../../extension';
import { AnyPreset, Preset, SetPresetPropertiesParameter } from '../preset-base';

// @ts-expect-error
class PresetNoName extends Preset {}

// @ts-expect-error
class NoExtensionPreset extends Preset {
  public name = 'noExtensions';

  protected createDefaultSettings() {
    return {};
  }
  protected createDefaultProperties() {
    return {};
  }
  protected onSetProperties(): void {
    return;
  }
}

class MissingSettingsPreset extends Preset<{ oops?: boolean }> {
  public name = 'missingSettings' as const;

  protected createDefaultProperties() {
    return {};
  }

  // @ts-expect-error
  protected createDefaultSettings() {
    return { a: '', oops: 'wrong type' };
  }

  protected onSetProperties(): void {
    return;
  }

  public createExtensions() {
    return [];
  }
}

class ExtensionWithSettings extends PlainExtension<{ oops: boolean }> {
  public static readonly defaultSettings = {};
  public static readonly defaultProperties = {};

  public name = 'withSettings' as const;

  protected createDefaultSettings() {
    return {};
  }
  protected createDefaultProperties() {
    return {};
  }
}

class WithSettingsPreset extends Preset<{ me: 'friend' | 'enemy' }> {
  public name = 'withSettings' as const;

  protected createDefaultProperties() {
    return {};
  }

  protected createDefaultSettings() {
    return { me: 'friend' as const };
  }

  protected onSetProperties(): void {
    return;
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

  protected onSetProperties(parameter: SetPresetPropertiesParameter<{ required: boolean }>): void {
    const { changes } = parameter;

    // @ts-expect-error
    ignoreUnused(changes.required.value);

    if (changes.required.changed) {
      const extension = this.getExtension(ExtensionWithSettings);
      changes.required.value;
    }
  }

  public createExtensions() {
    return [new ExtensionWithSettings({ oops: false })];
  }
}

new WithPropertiesPreset();
new WithPropertiesPreset({ properties: { required: false } });
