import { AnyExtension, AnyPlainExtension } from '../extension-base';
import { ExtensionFactory } from '../extension-factory';

const anyExtensionTester = <ExtensionUnion extends AnyExtension>(extension: ExtensionUnion) => {};

// Extension without settings.

const ExtensionWithoutSettings = ExtensionFactory.typed().plain({ name: 'withoutSettings' });
const extensionWithoutSettings = ExtensionWithoutSettings.of();

type AnyExtensionSupportsNoSettings = typeof extensionWithoutSettings extends AnyExtension
  ? true
  : never;
const anyExtensionSupportsNoSettings: AnyExtension = extensionWithoutSettings;
anyExtensionTester(extensionWithoutSettings);

// Extension with settings

const ExtensionWithSettings = ExtensionFactory.typed<{ oops: boolean }>().plain({
  name: 'withSettings',
  defaultSettings: {},
});

// @ts-expect-error
ExtensionWithSettings.of({});

// @ts-expect-error
ExtensionWithSettings.of();

const extensionWithSettings = ExtensionWithSettings.of({ oops: true });

type AnyExtensionsSupportsSettings = typeof extensionWithSettings extends AnyExtension
  ? true
  : never;
const anyExtensionsSupportsSettings: AnyExtensionsSupportsSettings = true;
anyExtensionTester(extensionWithSettings);

// Extension with properties

const ExtensionWithProperties = ExtensionFactory.typed<{}, { oops: boolean }>().plain({
  name: 'withProperties',
  defaultProperties: { oops: false },
});

// @ts-expect-error
ExtensionFactory.typed<{}, { oops: boolean }>().plain({
  name: 'withProperties',
});

const extensionWithProperties = ExtensionWithProperties.of();

type AnyExtensionsSupportsProperties = typeof extensionWithProperties extends AnyExtension
  ? true
  : never;
const anyExtensionsSupportsProperties: AnyExtension = extensionWithProperties;
anyExtensionTester(extensionWithProperties);
