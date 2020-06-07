import { ErrorConstant, ExtensionPriority } from '@remirror/core-constants';
import { entries, invariant, isFunction, object } from '@remirror/core-helpers';
import {
  ApplyExtraAttributes,
  EditorSchema,
  ExtraAttributes,
  MarkExtensionSpec,
  NodeExtensionSpec,
  ProsemirrorAttributes,
  Static,
} from '@remirror/core-types';
import { isElementDOMNode } from '@remirror/core-utils';
import { Schema } from '@remirror/pm/model';

import {
  CreateLifecycleMethod,
  GetMarkNameUnion,
  GetNodeNameUnion,
  isMarkExtension,
  isNodeExtension,
  PlainExtension,
  SchemaFromExtensionUnion,
} from '../extension';
import { AnyCombinedUnion, InferCombinedExtensions } from '../preset';

/**
 * This extension creates the schema and provides extra attributes as defined in
 * the manager or the extension settings.
 *
 * @builtin
 */
export class SchemaExtension extends PlainExtension {
  /**
   * Really this always needs to be the first extension to run.
   */
  static defaultPriority: ExtensionPriority = ExtensionPriority.Critical;

  get name() {
    return 'schema' as const;
  }

  onCreate: CreateLifecycleMethod = (extensions) => {
    const { managerSettings } = this.store;
    const nodes: Record<string, NodeExtensionSpec> = object();
    const marks: Record<string, MarkExtensionSpec> = object();
    const namedExtraAttributes = getManagerExtraAttributes(managerSettings);

    // Skip the for loop by setting the list to empty when extra attributes are disabled

    for (const extension of extensions) {
      const currentAttributes = namedExtraAttributes[extension.name] ?? object();

      namedExtraAttributes[extension.name] = {
        ...currentAttributes,
        ...(extension.options.extraAttributes ?? object()),
      };

      const ignoreExtraAttributes =
        managerSettings.disableExtraAttributes === true ||
        extension.options.disableExtraAttributes === true ||
        extension.constructor.disableExtraAttributes === true;

      if (isNodeExtension(extension)) {
        const spec = createSpec({
          createExtensionSpec: (extra) => extension.createNodeSpec(extra),
          extraAttributes: namedExtraAttributes[extension.name],
          ignoreExtraAttributes,
          name: extension.constructor.name,
        });

        extension.spec = spec;
        nodes[extension.name] = spec;
      }

      if (isMarkExtension(extension)) {
        const spec = createSpec({
          createExtensionSpec: (extra) => extension.createMarkSpec(extra),
          extraAttributes: namedExtraAttributes[extension.name],
          ignoreExtraAttributes,
          name: extension.constructor.name,
        });

        extension.spec = spec;
        marks[extension.name] = spec;
      }
    }

    const schema = new Schema({ nodes, marks });

    this.store.setStoreKey('nodes', nodes);
    this.store.setStoreKey('marks', marks);
    this.store.setStoreKey('schema', schema);
    this.store.setExtensionStore('schema', schema);
  };
}

/**
 * The interface for adding extra attributes to multiple node and mark
 * extensions.
 */
export interface ExtraSchemaAttributes {
  /**
   * The nodes or marks to add extra attributes to.
   */
  identifiers: string[];

  /**
   * The attributes to be added.
   */
  attributes: ExtraAttributes;
}

type NamedExtraAttributes = Record<string, ExtraAttributes>;

/**
 * Get the extension extra attributes
 */
function getManagerExtraAttributes(settings: Remirror.ManagerSettings) {
  const extraAttributes: NamedExtraAttributes = object();

  if (settings.disableExtraAttributes) {
    return extraAttributes;
  }

  for (const attributeGroup of settings.extraAttributes ?? []) {
    for (const identifier of attributeGroup.identifiers) {
      const currentValue = extraAttributes[identifier] ?? {};
      extraAttributes[identifier] = { ...currentValue, ...attributeGroup.attributes };
    }
  }

  return extraAttributes;
}

interface CreateSpecParameter<Type> {
  createExtensionSpec: (extra: ApplyExtraAttributes) => Type;
  extraAttributes: ExtraAttributes;
  ignoreExtraAttributes: boolean;
  /**
   * The name for displaying in an error message (prefer the constructor name)
   */
  name: string;
}

function createSpec<Type>(parameter: CreateSpecParameter<Type>): Type {
  const { createExtensionSpec, extraAttributes, ignoreExtraAttributes, name } = parameter;

  let defaultsCalled = false;

  const defaults = createDefaults(extraAttributes, ignoreExtraAttributes, () => {
    defaultsCalled = true;
  });

  const parse = createParseDOM(extraAttributes, ignoreExtraAttributes);

  const dom = createToDOM(extraAttributes, ignoreExtraAttributes);

  const spec = createExtensionSpec({ defaults, parse, dom });

  invariant(ignoreExtraAttributes || defaultsCalled, {
    code: ErrorConstant.EXTENSION_SPEC,
    message: `When creating a node specification you must call the 'defaults', and parse, and 'dom' methods. To avoid this error you can set the static property 'disableExtraAttributes' of '${name}' to 'true'.`,
  });

  return spec;
}

/**
 * Create the `defaults()` method which is used for setting the property .
 */
function createDefaults(
  extraAttributes: ExtraAttributes,
  shouldIgnore: boolean,
  onCalled: () => void,
) {
  // Store all the default attributes here.

  return () => {
    onCalled();
    const attributes: Record<string, { default: string | null }> = object();

    if (shouldIgnore) {
      return attributes;
    }

    // Loop through the extra attributes and attach to the attributes object.
    for (const [name, value] of entries(extraAttributes)) {
      attributes[name] = { default: value.default ?? null };
    }

    return attributes;
  };
}

/**
 * Create the parseDOM method to be applied to the extension `createNodeSpec`.
 */
function createParseDOM(extraAttributes: ExtraAttributes, shouldIgnore: boolean) {
  return (domNode: string | Node) => {
    const attributes: ProsemirrorAttributes = object();
    if (shouldIgnore) {
      return attributes;
    }
    for (const [name, { parseDOM, ...other }] of entries(extraAttributes)) {
      if (!isElementDOMNode(domNode)) {
        continue;
      }

      if (!isFunction(parseDOM)) {
        attributes[name] = domNode.getAttribute(name) ?? other.default;
      } else {
        attributes[name] = parseDOM(domNode) ?? other.default;
      }
    }

    return attributes;
  };
}

/**
 * Create the `toDOM` method to be applied to the extension `createNodeSpec`.
 */
function createToDOM(extraAttributes: ExtraAttributes, shouldIgnore: boolean) {
  return (attributes: ProsemirrorAttributes) => {
    const domAttributes: Record<string, string> = object();
    if (shouldIgnore) {
      return domAttributes;
    }
    for (const [name, { toDOM }] of entries(extraAttributes)) {
      if (!isFunction(toDOM)) {
        domAttributes[name] = attributes[name] as string;
      } else {
        domAttributes[name] = toDOM(attributes);
      }
    }

    return domAttributes;
  };
}

declare global {
  namespace Remirror {
    interface BaseExtensionOptions {
      /**
       * Inject additional attributes into the defined mark / node schema. This can
       * only be used for `NodeExtensions` and `MarkExtensions`.
       *
       * @remarks
       *
       * Sometimes you need to add additional attributes to a node or mark. This
       * property enables this without needing to create a new extension.
       *
       * @defaultValue `{}`
       */
      extraAttributes?: Static<ExtraAttributes>;

      /**
       * When true will disable extra attributes for this instance of the
       * extension.
       *
       * @defaultValue `undefined`
       */
      disableExtraAttributes?: Static<boolean>;
    }

    interface ManagerSettings {
      /**
       * Allows for setting extra attributes on multiple nodes and marks by
       * their name or constructor. These attributes are automatically added and
       * retrieved from from the dom by prosemirror.
       *
       * @remarks
       *
       * An example is shown below.
       *
       * ```ts
       * import { EditorManager } from 'remirror/core';
       *
       * const managerSettings = {
       *   extraAttributes: [
       *     {
       *       identifiers: ['blockquote', 'heading'],
       *       attributes: ['id', 'alignment'],
       *     }, {
       *       identifiers: ['mention', 'codeBlock'],
       *       attributes: ['user-id'],
       *     },
       *   ]
       * };
       *
       * const manager = EditorManager.create([], { extraAttributes })
       * ```
       */
      extraAttributes?: ExtraSchemaAttributes[];

      /**
       * Perhaps you don't need extra attributes at all in the editor. This
       * allows you to disable extra attributes when set to true.
       *
       * @defaultValue undefined
       */
      disableExtraAttributes?: boolean;
    }

    interface ManagerStore<Combined extends AnyCombinedUnion> {
      /**
       * The nodes to place on the schema.
       */
      nodes: Record<GetNodeNameUnion<InferCombinedExtensions<Combined>>, NodeExtensionSpec>;

      /**
       * The marks to be added to the schema.
       */
      marks: Record<GetMarkNameUnion<InferCombinedExtensions<Combined>>, MarkExtensionSpec>;

      /**
       * The schema created by this extension manager.
       */
      schema: SchemaFromExtensionUnion<InferCombinedExtensions<Combined>>;
    }

    interface MarkExtension {
      /**
       * Provides access to the `MarkExtensionSpec`.
       */
      spec: MarkExtensionSpec;
    }

    interface NodeExtension {
      /**
       * Provides access to the `NodeExtensionSpec`.
       */
      spec: NodeExtensionSpec;
    }

    interface ExtensionStore {
      /**
       * The Prosemirror schema being used for the current editor.
       *
       * @remarks
       *
       * The type is available when the manager initializes. So it can be used
       * in the outer scope of `createCommands`, `createHelpers`, `createKeymap`
       * and most of the creator methods.
       *
       * Available: *return function* - `onCreate`
       */
      schema: EditorSchema;
    }
  }
}
