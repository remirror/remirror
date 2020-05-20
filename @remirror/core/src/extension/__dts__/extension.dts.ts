import {
  AnyExtension,
  AnyMarkExtension,
  AnyNodeExtension,
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
  public name = 'withoutSettings' as const;

  protected createDefaultSettings(): import('../extension-base').DefaultSettingsType<{}> {
    throw new Error('Method not implemented.');
  }

  protected createDefaultProperties(): Required<{}> {
    throw new Error('Method not implemented.');
  }
}
const extensionWithoutSettings = new ExtensionWithoutSettings();

type AnyExtensionSupportsNoSettings = typeof extensionWithoutSettings extends AnyExtension
  ? true
  : never;
const anyExtensionSupportsNoSettings: AnyExtension = extensionWithoutSettings;
anyExtensionTester(extensionWithoutSettings);

// Extension with settings

class ExtensionWithSettings extends PlainExtension<{ oops: boolean }> {
  public name = 'withSettings' as const;

  protected createDefaultSettings(): import('../extension-base').DefaultSettingsType<{
    oops: boolean;
  }> {
    throw new Error('Method not implemented.');
  }

  protected createDefaultProperties(): Required<{}> {
    throw new Error('Method not implemented.');
  }
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
  public name = 'withProperties';

  protected createDefaultSettings(): import('../extension-base').DefaultSettingsType<{
    awesome?: string | undefined;
  }> {
    return { awesome: 'never' };
  }
  protected createDefaultProperties(): Required<{ oops: boolean }> {
    return { oops: false };
  }
}

new ExtensionWithProperties();

class NodeExtensionWithProperties extends NodeExtension<{ awesome?: string }, { oops: boolean }> {
  public name = 'withProperties' as const;

  protected createNodeSpec(): NodeExtensionSpec {
    return {};
  }

  protected createDefaultSettings(): import('../extension-base').DefaultSettingsType<{
    awesome?: string | undefined;
  }> {
    return { awesome: 'never' };
  }

  protected createDefaultProperties(): Required<{ oops: boolean }> {
    return { oops: false };
  }
}

class MarkExtensionWithProperties extends MarkExtension<{ awesome?: string }, { oops: boolean }> {
  public name = 'withProperties' as const;

  protected createMarkSpec() {
    return {};
  }

  protected createDefaultSettings(): import('../extension-base').DefaultSettingsType<{
    awesome?: string | undefined;
  }> {
    return { awesome: 'never' };
  }

  protected createDefaultProperties(): Required<{ oops: boolean }> {
    return { oops: false };
  }
}

class InvalidPropertiesExtension extends PlainExtension<{}, { oops: boolean }> {
  public name = 'withProperties' as const;
  protected createDefaultSettings(): import('../extension-base').DefaultSettingsType<{}> {
    return {};
  }
  protected createDefaultProperties(): Required<{ oops: boolean }> {
    // @ts-expect-error
    return {};
  }
}

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
