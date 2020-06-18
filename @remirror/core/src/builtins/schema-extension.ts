import { ErrorConstant, ExtensionPriority } from '@remirror/core-constants';
import {
  entries,
  invariant,
  isArray,
  isFunction,
  isNullOrUndefined,
  isString,
  object,
} from '@remirror/core-helpers';
import {
  ApplySchemaAttributes,
  EditorSchema,
  Mark,
  MarkExtensionSpec,
  NodeExtensionSpec,
  NodeMarkOptions,
  ProsemirrorAttributes,
  ProsemirrorNode,
  SchemaAttributes,
  SchemaAttributesObject,
  Static,
} from '@remirror/core-types';
import { isElementDomNode, isProsemirrorMark, isProsemirrorNode } from '@remirror/core-utils';
import { Schema } from '@remirror/pm/model';

import {
  AnyExtension,
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
    const namedExtraAttributes = transformExtraAttributes({
      settings: managerSettings,
      gatheredSchemaAttributes: this.gatherExtraAttributes(extensions),
      nodeNames: this.store.nodeNames,
      markNames: this.store.markNames,
    });

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

  /**
   * Gather all the extra attributes that have been added by extensions.
   */
  private gatherExtraAttributes(extensions: readonly AnyExtension[]) {
    const extraSchemaAttributes: IdentifierSchemaAttributes[] = [];

    for (const extension of extensions) {
      if (!extension.createSchemaAttributes) {
        continue;
      }

      extraSchemaAttributes.push(...extension.createSchemaAttributes());
    }

    return extraSchemaAttributes;
  }
}

/**
 * The extra identifiers that can be used.
 */
export type Identifiers = 'nodes' | 'marks' | 'all' | string[];

/**
 * The interface for adding extra attributes to multiple node and mark
 * extensions.
 */
export interface IdentifierSchemaAttributes {
  /**
   * The nodes or marks to add extra attributes to.
   *
   * This can either be an array of the strings or the following specific
   * identifiers:
   *
   * - 'nodes' for all nodes
   * - 'marks' for all marks
   * - 'all' for all extensions which touch the schema.
   */
  identifiers: Identifiers;

  /**
   * The attributes to be added.
   */
  attributes: SchemaAttributes;
}

type NamedSchemaAttributes = Record<string, SchemaAttributes>;

interface TransformSchemaAttributesParameter {
  settings: Remirror.ManagerSettings;
  gatheredSchemaAttributes: IdentifierSchemaAttributes[];
  nodeNames: readonly string[];
  markNames: readonly string[];
}

/**
 * Get the extension extra attributes
 */
function transformExtraAttributes({
  settings,
  gatheredSchemaAttributes: gatheredExtraAttributes,
  nodeNames,
  markNames,
}: TransformSchemaAttributesParameter) {
  const extraAttributes: NamedSchemaAttributes = object();

  if (settings.disableExtraAttributes) {
    return extraAttributes;
  }

  const extraSchemaAttributes: IdentifierSchemaAttributes[] = [
    ...gatheredExtraAttributes,
    ...(settings.extraAttributes ?? []),
  ];

  for (const attributeGroup of extraSchemaAttributes ?? []) {
    const identifiers = getIdentifiers({
      identifiers: attributeGroup.identifiers,
      nodeNames,
      markNames,
    });

    for (const identifier of identifiers) {
      const currentValue = extraAttributes[identifier] ?? {};
      extraAttributes[identifier] = { ...currentValue, ...attributeGroup.attributes };
    }
  }

  return extraAttributes;
}

interface GetIdentifiersParameter {
  identifiers: Identifiers;
  nodeNames: readonly string[];
  markNames: readonly string[];
}

function getIdentifiers(parameter: GetIdentifiersParameter): readonly string[] {
  const { identifiers, nodeNames, markNames } = parameter;

  if (isArray(identifiers)) {
    return identifiers;
  }

  switch (identifiers) {
    case 'nodes':
      return nodeNames;
    case 'marks':
      return markNames;
    default:
      return [...nodeNames, ...markNames];
  }
}

interface CreateSpecParameter<Type> {
  createExtensionSpec: (extra: ApplySchemaAttributes) => Type;
  extraAttributes: SchemaAttributes;
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
 * Get the value of the extra attribute as an object.
 */
function getExtraAttributesObject(value: string | SchemaAttributesObject): SchemaAttributesObject {
  if (isString(value)) {
    return { default: value };
  }

  invariant(value, {
    message: `${value} is not supported`,
    code: ErrorConstant.EXTENSION_EXTRA_ATTRIBUTES,
  });

  return value;
}

/**
 * Create the `defaults()` method which is used for setting the property .
 */
function createDefaults(
  extraAttributes: SchemaAttributes,
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
    for (const [name, config] of entries(extraAttributes)) {
      const value = getExtraAttributesObject(config);
      attributes[name] = { default: value.default ?? null };
    }

    return attributes;
  };
}

/**
 * Create the parseDOM method to be applied to the extension `createNodeSpec`.
 */
function createParseDOM(extraAttributes: SchemaAttributes, shouldIgnore: boolean) {
  return (domNode: string | Node) => {
    const attributes: ProsemirrorAttributes = object();
    if (shouldIgnore) {
      return attributes;
    }
    for (const [name, config] of entries(extraAttributes)) {
      const { parseDOM, ...other } = getExtraAttributesObject(config);

      if (!isElementDomNode(domNode)) {
        continue;
      }

      if (isNullOrUndefined(parseDOM)) {
        attributes[name] = domNode.getAttribute(name) ?? other.default;
        continue;
      }

      if (isFunction(parseDOM)) {
        attributes[name] = parseDOM(domNode) ?? other.default;
        continue;
      }

      attributes[name] = domNode.getAttribute(parseDOM) ?? other.default;
    }

    return attributes;
  };
}

/**
 * Create the `toDOM` method to be applied to the extension `createNodeSpec`.
 */
function createToDOM(extraAttributes: SchemaAttributes, shouldIgnore: boolean) {
  return (item: ProsemirrorNode | Mark) => {
    const domAttributes: Record<string, string> = object();

    if (shouldIgnore) {
      return domAttributes;
    }

    function updateDomAttributes(
      value: string | [string, string?] | undefined | null,
      name: string,
    ) {
      if (isString(value)) {
        domAttributes[name] = value;
      }

      if (isArray(value)) {
        domAttributes[value[0]] = value[1] ?? (item.attrs[name] as string);
      }

      return;
    }

    for (const [name, config] of entries(extraAttributes)) {
      const { toDOM, parseDOM } = getExtraAttributesObject(config);

      if (isNullOrUndefined(toDOM)) {
        const key = isString(parseDOM) ? parseDOM : name;
        domAttributes[key] = item.attrs[name] as string;

        continue;
      }

      if (isFunction(toDOM)) {
        updateDomAttributes(toDOM(item.attrs, getNodeMarkOptions(item)), name);

        continue;
      }

      updateDomAttributes(toDOM, name);
    }

    return domAttributes;
  };
}

/**
 * Get the options object which applies should be used to obtain the node or mark type.
 */
function getNodeMarkOptions(item: ProsemirrorNode | Mark): NodeMarkOptions {
  if (isProsemirrorNode(item)) {
    return { node: item };
  }

  if (isProsemirrorMark(item)) {
    return { mark: item };
  }

  return {};
}

declare global {
  namespace Remirror {
    interface ExtensionCreatorMethods {
      /**
       * Allows the extension to create an extra attributes array that will be
       * added to the extra attributes.
       *
       * For example the `@remirror/extension-bidi` adds a `dir` attribute to
       * all node extensions which allows them to automatically infer whether
       * the text direction should be right to left, or left to right.
       */
      createSchemaAttributes?: () => IdentifierSchemaAttributes[];
    }
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
      extraAttributes?: Static<SchemaAttributes>;

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
       *       attributes: { id: 'id', alignment: '0', },
       *     }, {
       *       identifiers: ['mention', 'codeBlock'],
       *       attributes: { 'userId': { default: null } },
       *     },
       *   ]
       * };
       *
       * const manager = EditorManager.create([], { extraAttributes })
       * ```
       */
      extraAttributes?: IdentifierSchemaAttributes[];

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
