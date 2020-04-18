import { ExtensionFactory } from '../../extension';
import { PresetFactory } from '../preset-factory';

// @ts-expect-error
const PresetNoName = PresetFactory.typed().preset({});

// @ts-expect-error
const PresetNoExtensions = PresetFactory.typed().preset({
  name: 'noExtensions',
});

// @ts-expect-error
const PresetMissingSettings = PresetFactory.typed<{ oops?: boolean }>().preset({
  name: 'missingSettings',
  createExtensions: () => [],
});

const ExtensionWithSettings = ExtensionFactory.typed<{ oops: boolean }>().plain({
  name: 'withSettings',
  defaultSettings: {},
});

const PresetExtensionWithSettings = PresetFactory.typed().preset({
  name: 'extensionWithSettings',
  createExtensions() {
    return [ExtensionWithSettings.of({ oops: true })];
  },
});
