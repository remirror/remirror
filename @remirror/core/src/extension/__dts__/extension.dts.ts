import {
  AnyExtension,
  AnyExtensionConstructor,
  AnyMarkExtension,
  AnyNodeExtension,
  EditorManager,
  MarkExtension,
  NodeExtension,
  NodeExtensionSpec,
  PlainExtension,
  RemirrorIdentifier,
} from '../../..';

const anyExtensionTester = <ExtensionUnion extends AnyExtension>(extension: ExtensionUnion) => {};
const anyNodeExtensionTester = <ExtensionUnion extends AnyNodeExtension>(
  extension: ExtensionUnion,
) => {};
const anyMarkExtensionTester = <ExtensionUnion extends AnyMarkExtension>(
  extension: ExtensionUnion,
) => {};

// Extension without settings.

class ExtensionWithoutSettings extends PlainExtension {
  public static readonly defaultSettings = {};
  public static readonly defaultProperties = {};

  public readonly name = 'withoutSettings' as const;
}
const extensionWithoutSettings = new ExtensionWithoutSettings();

type AnyExtensionSupportsNoSettings = typeof extensionWithoutSettings extends AnyExtension
  ? true
  : never;
const anyExtensionSupportsNoSettings: AnyExtension = extensionWithoutSettings;
anyExtensionTester(extensionWithoutSettings);

// Extension with settings

class ExtensionWithSettings extends PlainExtension<{ oops: boolean }> {
  public static readonly defaultSettings = {};
  public static readonly defaultProperties = {};

  public readonly name = 'withSettings' as const;
}

// @ts-expect-error
new ExtensionWithSettings({});

// @ts-expect-error
new ExtensionWithSettings();

const extensionWithSettings = new ExtensionWithSettings({ oops: true });

type AnyExtensionsSupportsSettings = typeof extensionWithSettings extends AnyExtension
  ? true
  : never;
const anyExtensionsSupportsSettings: AnyExtensionsSupportsSettings = true;
anyExtensionTester(extensionWithSettings);

// Extension with properties

class ExtensionWithProperties extends PlainExtension<{ awesome?: string }, { oops: boolean }> {
  public static readonly defaultSettings = { awesome: 'never' };
  public static readonly defaultProperties = { oops: false };

  public readonly name = 'withProperties' as const;
}

new ExtensionWithProperties();

class NodeExtensionWithProperties extends NodeExtension<{ awesome?: string }, { oops: boolean }> {
  public readonly name = 'withProperties' as const;

  protected createNodeSpec(): NodeExtensionSpec {
    return {};
  }
}

class MarkExtensionWithProperties extends MarkExtension<{ awesome?: string }, { oops: boolean }> {
  public static readonly defaultSettings = { awesome: 'nice' };
  public static readonly defaultProperties = { oops: true };

  public readonly name = 'withProperties' as const;

  protected createMarkSpec() {
    return {};
  }
}

class InvalidPropertiesExtension extends PlainExtension<{}, { oops: boolean }> {
  public static readonly defaultSettings = {};
  public static readonly defaultProperties = {};

  public readonly name = 'withProperties' as const;
}

function fn<Type extends AnyExtension>(extension: Type) {}
fn(new InvalidPropertiesExtension());

const extensionWithProperties = new ExtensionWithProperties({ properties: { oops: true } });
const anyExtensionsSupportsProperties: AnyExtension = extensionWithProperties;
anyExtensionTester(extensionWithProperties);
// @ts-expect-error
anyNodeExtensionTester(extensionWithProperties);
// @ts-expect-error
anyMarkExtensionTester(extensionWithProperties);

const nodeExtensionWithProperties = new NodeExtensionWithProperties({ properties: { oops: true } });
const anyNodeExtensionsSupportsProperties: AnyNodeExtension = nodeExtensionWithProperties;
anyExtensionTester(nodeExtensionWithProperties);
anyNodeExtensionTester(nodeExtensionWithProperties);
// @ts-expect-error
anyMarkExtensionTester(nodeExtensionWithProperties);

const markExtensionWithProperties = new MarkExtensionWithProperties({ properties: { oops: true } });
const anyMarkExtensionsSupportsProperties: AnyMarkExtension = markExtensionWithProperties;
anyExtensionTester(markExtensionWithProperties);
anyMarkExtensionTester(markExtensionWithProperties);
// @ts-expect-error
anyNodeExtensionTester(markExtensionWithProperties);

const a: RemirrorIdentifier.NodeExtension = anyMarkExtensionsSupportsProperties['~~remirror~~'];
