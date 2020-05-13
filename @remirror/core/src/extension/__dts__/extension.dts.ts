import { AnyExtension, AnyNodeExtension, AnyMarkExtension } from '../extension-base';
import { ExtensionFactory } from '../extension-factory';

const anyExtensionTester = <ExtensionUnion extends AnyExtension>(extension: ExtensionUnion) => {};
const anyNodeExtensionTester = <ExtensionUnion extends AnyNodeExtension>(
  extension: ExtensionUnion,
) => {};
const anyMarkExtensionTester = <ExtensionUnion extends AnyMarkExtension>(
  extension: ExtensionUnion,
) => {};

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

const ExtensionWithProperties = ExtensionFactory.typed<
  { awesome?: string },
  { oops: boolean }
>().plain({
  name: 'withProperties',
  defaultSettings: { awesome: 'never' },
  defaultProperties: { oops: false },
});
const NodeExtensionWithProperties = ExtensionFactory.typed<
  { awesome?: string },
  { oops: boolean }
>().node({
  name: 'withProperties',
  defaultSettings: { awesome: 'never' },
  defaultProperties: { oops: false },
  createNodeSchema() {
    return {};
  },
});
const MarkExtensionWithProperties = ExtensionFactory.typed<
  { awesome?: string },
  { oops: boolean }
>().mark({
  name: 'withProperties',
  defaultSettings: { awesome: 'never' },
  defaultProperties: { oops: false },
  createMarkSchema() {
    return {};
  },
});

// @ts-expect-error
ExtensionFactory.typed<{}, { oops: boolean }>().plain({
  name: 'withProperties',
});

const extensionWithProperties = ExtensionWithProperties.of({ properties: { oops: true } });
type AnyExtensionsSupportsProperties = typeof extensionWithProperties extends AnyExtension
  ? true
  : never;
const anyExtensionsSupportsProperties: AnyExtension = extensionWithProperties;
anyExtensionTester(extensionWithProperties);
// @ts-expect-error
anyNodeExtensionTester(extensionWithProperties);
// @ts-expect-error
anyMarkExtensionTester(extensionWithProperties);

const nodeExtensionWithProperties = NodeExtensionWithProperties.of({ properties: { oops: true } });
const anyNodeExtensionsSupportsProperties: AnyNodeExtension = nodeExtensionWithProperties;
anyExtensionTester(nodeExtensionWithProperties);
anyNodeExtensionTester(nodeExtensionWithProperties);
// @ts-expect-error
anyMarkExtensionTester(nodeExtensionWithProperties);

const markExtensionWithProperties = MarkExtensionWithProperties.of({ properties: { oops: true } });
const anyMarkExtensionsSupportsProperties: AnyMarkExtension = markExtensionWithProperties;
anyExtensionTester(markExtensionWithProperties);
anyMarkExtensionTester(markExtensionWithProperties);
// @ts-expect-error
anyNodeExtensionTester(markExtensionWithProperties);

const a = anyMarkExtensionsSupportsProperties['~~remirror~~'];
