import type {
  ApplySchemaAttributes,
  CustomHandler,
  CustomHandlerKeyList,
  Handler,
  HandlerKeyList,
  Static,
} from '@remirror/core-types';

import type { AddCustomHandler } from '../';
import {
  AnyExtension,
  AnyMarkExtension,
  AnyNodeExtension,
  DefaultExtensionOptions,
  MarkExtension,
  NodeExtension,
  NodeExtensionSpec,
  PlainExtension,
} from '../';

const anyExtensionTester = <Extension extends AnyExtension>(extension: Extension) => {};
const anyNodeExtensionTester = <Extension extends AnyNodeExtension>(extension: Extension) => {};
const anyMarkExtensionTester = <Extension extends AnyMarkExtension>(extension: Extension) => {};

// Extension without settings.

class ExtensionWithoutStaticOptions extends PlainExtension {
  get name() {
    return 'withoutStaticOptions' as const;
  }
}

const extensionWithoutStaticOptions = new ExtensionWithoutStaticOptions();

type AnyExtensionSupportsNoStaticOptions = typeof extensionWithoutStaticOptions extends AnyExtension
  ? true
  : never;
const anyExtensionSupportsNoStaticOptions: AnyExtension = extensionWithoutStaticOptions;
anyExtensionTester(extensionWithoutStaticOptions);

// Extension with settings

class ExtensionWithStaticOptions extends PlainExtension<{ oops: Static<boolean> }> {
  get name() {
    return 'withStaticOptions' as const;
  }
}

// @ts-expect-error
new ExtensionWithStaticOptions({});

// @ts-expect-error
new ExtensionWithStaticOptions();

const extensionWithStaticOptions = new ExtensionWithStaticOptions({ oops: true });

type AnyExtensionsSupportsStaticOptions = typeof extensionWithStaticOptions extends AnyExtension
  ? true
  : false;
const anyExtensionsSupportsStaticOptions: AnyExtensionsSupportsStaticOptions = true;
anyExtensionTester(extensionWithStaticOptions);

// Extension with properties

interface WithDynamicOptions {
  awesome?: Static<string>;
  oops: boolean;
  onChange: Handler<() => void>;
}

const defaultOptions: DefaultExtensionOptions<WithDynamicOptions> = {
  awesome: 'yes indeed',
  oops: false,
};
// @ts-expect-error
const failDefaultOptions: DefaultExtensionOptions<WithDynamicOptions> = { onChange: () => {} };

class ExtensionWithDynamicOptions extends PlainExtension<WithDynamicOptions> {
  static readonly defaultOptions: DefaultExtensionOptions<WithDynamicOptions> = {
    awesome: 'yes indeed',
    oops: true,
  };

  get name() {
    return 'withDynamicOptions' as const;
  }
}

new ExtensionWithDynamicOptions();

class NodeExtensionWithDynamicOptions extends NodeExtension<WithDynamicOptions> {
  get name() {
    return 'nodeWithDynamicOptions' as const;
  }

  createNodeSpec(extra: ApplySchemaAttributes): NodeExtensionSpec {
    return {};
  }
}

class MarkExtensionWithDynamicOptions extends MarkExtension<WithDynamicOptions> {
  static readonly defaultStaticOptions = { awesome: 'nice' };
  static readonly defaultDynamicOptions = { oops: true };

  get name() {
    return 'markWithDynamicOptions' as const;
  }

  createMarkSpec() {
    return {};
  }
}

class InvalidDynamicOptionsExtension extends PlainExtension<{ oops: boolean }> {
  get name() {
    return 'invalidWithDynamicOptions' as const;
  }
}

function fn<Type extends AnyExtension>(extension: Type) {}

fn(new InvalidDynamicOptionsExtension());

const extensionWithDynamicOptions = new ExtensionWithDynamicOptions({ oops: true });
const anyExtensionsSupportsDynamicOptions: AnyExtension = extensionWithDynamicOptions;
anyExtensionTester(extensionWithDynamicOptions);
// @ts-expect-error
anyNodeExtensionTester(extensionWithDynamicOptions);
// @ts-expect-error
anyMarkExtensionTester(extensionWithDynamicOptions);

const nodeExtensionWithDynamicOptions = new NodeExtensionWithDynamicOptions({ oops: true });
const anyNodeExtensionsSupportsDynamicOptions: AnyNodeExtension = nodeExtensionWithDynamicOptions;
anyExtensionTester(nodeExtensionWithDynamicOptions);
anyNodeExtensionTester(nodeExtensionWithDynamicOptions);
// @ts-expect-error
anyMarkExtensionTester(nodeExtensionWithDynamicOptions);

const markExtensionWithDynamicOptions = new MarkExtensionWithDynamicOptions({ oops: true });
const anyMarkExtensionsSupportsDynamicOptions: AnyMarkExtension = markExtensionWithDynamicOptions;
anyExtensionTester(markExtensionWithDynamicOptions);
anyMarkExtensionTester(markExtensionWithDynamicOptions);
// @ts-expect-error
anyNodeExtensionTester(markExtensionWithDynamicOptions);

// Handlers

interface WithHandlers {
  onChange: Handler<(text: string) => void>;
  onUpdate: Handler<(valid: boolean) => void>;
  bindings: CustomHandler<Record<string, (value: string) => boolean>>;
}

class ExtensionWithHandlers extends PlainExtension<WithHandlers> {
  static defaultOptions: DefaultExtensionOptions<WithHandlers> = {};
  static handlerKeys: HandlerKeyList<WithHandlers> = ['onChange', 'onUpdate'];
  static customHandlerKeys: CustomHandlerKeyList<WithHandlers> = ['bindings'];

  get name() {
    return 'withHandlers' as const;
  }

  protected onAddCustomHandler: AddCustomHandler<WithHandlers> = (props) => {
    const { bindings } = props;

    if (bindings) {
      bindings.a?.('');
      // @ts-expect-error
      bindings.b(100);
    }

    return () => {};
  };
}

const withHandlers = new ExtensionWithHandlers();

withHandlers.addCustomHandler('bindings', {});
// @ts-expect-error
withHandlers.addCustomHandler('oops', {});
// @ts-expect-error
withHandlers.addCustomHandler('bindings', { value: () => '' });

withHandlers.addHandler('onChange', (value: string) => {});
// @ts-expect-error
withHandlers.addHandler('onUpdate', (value: string) => {});
