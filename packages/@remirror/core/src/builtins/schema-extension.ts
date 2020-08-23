import { ErrorConstant, ExtensionPriority } from '@remirror/core-constants';
import {
  entries,
  invariant,
  isArray,
  isEmptyObject,
  isFunction,
  isNullOrUndefined,
  isString,
  object,
  toString,
} from '@remirror/core-helpers';
import type {
  ApplySchemaAttributes,
  DynamicAttributeCreator,
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
  Transaction,
} from '@remirror/core-types';
import {
  findChildren,
  getMarkRange,
  isElementDomNode,
  isProsemirrorMark,
  isProsemirrorNode,
  NodeWithPosition,
} from '@remirror/core-utils';
import { Schema } from '@remirror/pm/model';

import { extensionDecorator } from '../decorators';
import {
  AnyExtension,
  GetMarkNameUnion,
  GetNodeNameUnion,
  isMarkExtension,
  isNodeExtension,
  PlainExtension,
  SchemaFromExtensionUnion,
} from '../extension';
import type { AnyCombinedUnion, InferCombinedExtensions } from '../preset';
import type { CreatePluginReturn } from '../types';

/**
 * This is the schema extension which creates the schema and provides extra
 * attributes as defined in the manager or the extension settings.
 *
 * @remarks
 *
 * The schema is the most important part of the remirror editor. This is the
 * extension responsible for creating it, injecting extra attributes and
 * managing the plugin which is responsible for making sure dynamically created
 * attributes are updated.
 *
 * In order to add extra attributes the following would work.
 *
 * ```ts
 * import { RemirrorManager } from 'remirror/core';
 * import uuid from 'uuid';
 * import hash from 'made-up-hasher';
 *
 * const manager = RemirrorManager.create([], {
 *   extraAttributes: [
 *     {
 *       identifiers: 'nodes',
 *       attributes: {
 *         awesome: {
 *           default: 'awesome',
 *           parseDOM: (domNode) => domNode.getAttribute('data-awesome'),
 *           toDOM: (node) => ({ 'data-awesome': node.attrs.awesome })
 *         },
 *       },
 *     },
 *     { identifiers: ['paragraph'], attributes: { id: { default: () => uuid() } } },
 *     { identifiers: ['bold'], attributes: { hash: (mark) => hash(JSON.stringify(mark.attrs)) } },
 *   ],
 * })
 * ```
 *
 * It is an array of identifiers and attributes. Setting the default to a
 * function allows you to set up a dynamic attribute which is updated with the
 * synchronous function that you provide to it.
 *
 * @builtin
 */
@extensionDecorator({ defaultPriority: ExtensionPriority.Highest })
export class SchemaExtension extends PlainExtension {
  get name() {
    return 'schema' as const;
  }

  /**
   * The dynamic attributes for each node and mark extension.
   *
   * The structure will look like the following.
   *
   * ```ts
   * {
   *   paragraph: { id: () => uid(), hash: (node) => hash(node) },
   *   bold: { random: () => Math.random(), created: () => Date.now() },
   * };
   * ```
   *
   * This object is used by the created plugin to listen for changes to the doc,
   * and check for new nodes and marks which haven't yet applied the dynamic
   * attribute and add the attribute.
   */
  #dynamicAttributes: DynamicSchemaAttributeCreators = { marks: object(), nodes: object() };

  /**
   * This method is responsible for creating, configuring and adding the
   * `schema` to the editor. `Schema` is a special type in ProseMirror editors
   * and with `remirror` it's all just handled for you.
   *
   * TODO: Add support for using a custom schema #460
   */
  onCreate(): void {
    const { managerSettings } = this.store;

    // This nodes object is built up for each extension and then at the end it
    // will be passed to the `Schema` constructor to create a new `schema`.
    const nodes: Record<string, NodeExtensionSpec> = object();

    // Similar to the `nodes` object above this is passed to the `Schema`.
    const marks: Record<string, MarkExtensionSpec> = object();

    // Get the named extra attributes from the manager. This allows each extra
    // attribute group added to the manager to be applied to the individual
    // extensions which specified.
    const namedExtraAttributes = getNamedSchemaAttributes({
      settings: managerSettings,
      gatheredSchemaAttributes: this.gatherExtraAttributes(this.store.extensions),
      nodeNames: this.store.nodeNames,
      markNames: this.store.markNames,
    });

    for (const extension of this.store.extensions) {
      // Pick the current attributes from the named attributes and merge them
      // with the extra attributes which were added to the extension. Extra
      // attributes added to the extension are prioritized.
      namedExtraAttributes[extension.name] = {
        ...namedExtraAttributes[extension.name],
        ...extension.options.extraAttributes,
      };

      // There are several places that extra attributes can be ignored. This
      // checks them all.
      const ignoreExtraAttributes =
        managerSettings.disableExtraAttributes === true ||
        extension.options.disableExtraAttributes === true ||
        extension.constructor.disableExtraAttributes === true;

      if (isNodeExtension(extension)) {
        // Create the spec and gather dynamic attributes for this node
        // extension.
        const { spec, dynamic } = createSpec({
          createExtensionSpec: (extra) => extension.createNodeSpec(extra),
          extraAttributes: namedExtraAttributes[extension.name],
          ignoreExtraAttributes,
          name: extension.constructor.name,
        });

        // Store the node spec on the extension for future reference.
        extension.spec = spec;

        // Add the spec to the nodes object which is used to create the schema
        // with the same name as the extension name.
        nodes[extension.name] = spec;

        // Keep track of the dynamic attributes. The `extension.name` is the
        // same name of the `NodeType` and is used by the plugin in this
        // extension to dynamically generate attributes for the correct nodes.
        this.#dynamicAttributes.nodes[extension.name] = dynamic;
      }

      // Very similar to the previous conditional block except for marks rather
      // than nodes.
      if (isMarkExtension(extension)) {
        // Create the spec and gather dynamic attributes for this mark
        // extension.
        const { spec, dynamic } = createSpec({
          createExtensionSpec: (extra) => extension.createMarkSpec(extra),
          extraAttributes: namedExtraAttributes[extension.name],
          ignoreExtraAttributes,
          name: extension.constructor.name,
        });

        // Store the mark spec on the extension for future reference.
        extension.spec = spec;

        // Add the spec to the `marks` object which is used to create the schema
        // with the same name as the extension name.
        marks[extension.name] = spec;
        this.#dynamicAttributes.marks[extension.name] = dynamic;
      }
    }

    // Create the schema from the gathered nodes and marks.
    const schema = new Schema({ nodes, marks });

    // Store the `nodes`, `marks` and `schema` on the manager store. For example
    // the `schema` can be accessed via `manager.store.schema`.
    this.store.setStoreKey('nodes', nodes);
    this.store.setStoreKey('marks', marks);
    this.store.setStoreKey('schema', schema);

    // Add the schema to the extension store, so that all extension from this
    // point have access to the schema via `this.store.schema`.
    this.store.setExtensionStore('schema', schema);
  }

  /**
   * This creates the plugin that is used to automatically create the dynamic
   * attributes defined in the extra attributes object.
   */
  createPlugin(): CreatePluginReturn {
    return {
      appendTransaction: (transactions, _, nextState) => {
        // This creates a new transaction which will be used to update the
        // attributes of any node and marks which
        const { tr } = nextState;

        // The dynamic attribute updates only need to be run if the document has
        // been modified in a transaction.
        const documentHasChanged = transactions.some((tr) => tr.docChanged);

        if (!documentHasChanged) {
          // The document has not been changed therefore no updates are
          // required.
          return null;
        }

        // The find children method could potentially be quite expensive. Before
        // committing to that level of work let's check that there user has
        // actually defined some dynamic attributes.
        if (
          isEmptyObject(this.#dynamicAttributes.nodes) ||
          isEmptyObject(this.#dynamicAttributes.marks)
        ) {
          return null;
        }

        // This function loops through every node in the document and add the
        // dynamic attributes when any relevant nodes have been added.
        findChildren({
          // The parent node is the entire document.
          node: tr.doc,

          // This means that all nodes will be checked since it always returns
          // true.
          predicate: () => true,

          // An action handler which is called whenever the predicate is truthy,
          // which in this case is all the time.
          action: (child) => {
            this.checkAndUpdateDynamicNodes(child, tr);
            this.checkAndUpdateDynamicMarks(child, tr);
          },
        });

        // If the transaction has any `steps` then it has been modified and
        // should be returned i.e. appended to the additional transactions.
        // However, if there are no steps then ignore and return `null`.
        return tr.steps.length > 0 ? tr : null;
      },
    };
  }

  /**
   * Check the dynamic nodes to see if the provided node:
   *
   * - a) is dynamic and therefore can be updated.
   * - b) has just been created and does not yet have a value for the dynamic
   *   node.
   *
   * @param child - the node and its position.
   * @param tr - the mutable ProseMirror transaction which is applied to create
   * the next editor state
   */
  private checkAndUpdateDynamicNodes(child: NodeWithPosition, tr: Transaction) {
    const { node, pos } = child;

    // Check for matching nodes.
    for (const [name, dynamic] of entries(this.#dynamicAttributes.nodes)) {
      if (node.type.name !== name) {
        continue;
      }

      for (const [attributeName, attributeCreator] of entries(dynamic)) {
        if (!isNullOrUndefined(node.attrs[attributeName])) {
          continue;
        }

        // The new attributes which will be added to the node.
        const attrs = { ...node.attrs, [attributeName]: attributeCreator(node) };

        // Apply the new dynamic attribute to the node via the transaction.
        tr.setNodeMarkup(pos, undefined, attrs);
      }
    }
  }

  /**
   * Loop through the dynamic marks to see if the provided node:
   *
   * - a) is wrapped by a matching mark.
   * - b) has just been added and doesn't yet have the dynamic attribute
   *   applied.
   *
   * @param child - the node and its position.
   * @param tr - the mutable ProseMirror transaction which is applied to create
   * the next editor state.
   */
  private checkAndUpdateDynamicMarks(child: NodeWithPosition, tr: Transaction) {
    const { node, pos } = child;

    // Check for matching marks.
    for (const [name, dynamic] of entries(this.#dynamicAttributes.marks)) {
      // This is needed to create the new mark. Even though a mark may already
      // exist ProseMirror requires that a new one is created and added in
      // order. More details available
      // [here](https://discuss.prosemirror.net/t/updating-mark-attributes/776/2?u=ifi).
      const type = this.store.schema.marks[name];

      // Get the attrs from the mark.
      const mark = node.marks.find((mark) => mark.type.name === name);

      // If the mark doesn't exist within the set then move to the next
      // dynamically updated mark.
      if (!mark) {
        continue;
      }

      // Loop through to find if any of the required matches are missing from
      // the dynamic attribute;
      for (const [attributeName, attributeCreator] of entries(dynamic)) {
        // When the attributes for this dynamic attributeName are already
        // defined we should move onto the next item;
        if (!isNullOrUndefined(mark.attrs[attributeName])) {
          continue;
        }

        // Use the position to calculate the range range of the current mark.
        const range = getMarkRange(tr.doc.resolve(pos), type);

        if (!range) {
          continue;
        }

        // The { from, to } range which will be used to update the mark id
        // attribute.
        const { from, to } = range;

        // Create the new mark with all the existing dynamic attributes applied.
        const newMark = type.create({
          ...mark.attrs,
          [attributeName]: attributeCreator(mark),
        });

        // Update the value of the mark. The only way to do this right now is to
        // remove and then add it back again.
        tr.removeMark(from, to, type).addMark(from, to, newMark);
      }
    }
  }

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
 *
 * TODO: Add support for tags #463
 */
export type Identifiers = 'nodes' | 'marks' | 'all' | readonly string[];

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

/**
 * An object of `mark` and `node` dynamic schema attribute creators.
 */
interface DynamicSchemaAttributeCreators {
  /**
   * The dynamic schema attribute creators for all marks in the editor.
   */
  marks: Record<string, Record<string, DynamicAttributeCreator>>;

  /**
   * The dynamic schema attribute creators for all nodes in the editor.
   */
  nodes: Record<string, Record<string, DynamicAttributeCreator>>;
}

/**
 * The schema attributes mapped to the names of the extension they belong to.
 */
type NamedSchemaAttributes = Record<string, SchemaAttributes>;

interface TransformSchemaAttributesParameter {
  /**
   * The manager settings at the point of creation.
   */
  settings: Remirror.ManagerSettings;

  /**
   * The schema attributes which were added to the `manager`.
   */
  gatheredSchemaAttributes: IdentifierSchemaAttributes[];

  /**
   * The names of all the nodes within the editor.
   */
  nodeNames: readonly string[];

  /**
   * The names of all the marks within the editor.
   */
  markNames: readonly string[];
}

/**
 * Get the extension extra attributes created via the manager and convert into a
 * named object which can be added to each node and mark spec.
 */
function getNamedSchemaAttributes(
  parameter: TransformSchemaAttributesParameter,
): NamedSchemaAttributes {
  const { settings, gatheredSchemaAttributes, nodeNames, markNames } = parameter;
  const extraAttributes: NamedSchemaAttributes = object();

  if (settings.disableExtraAttributes) {
    return extraAttributes;
  }

  const extraSchemaAttributes: IdentifierSchemaAttributes[] = [
    ...gatheredSchemaAttributes,
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
  /**
   * The node or mark creating function.
   */
  createExtensionSpec: (extra: ApplySchemaAttributes) => Type;

  /**
   * The extra attributes object which has been passed through for this
   * extension.
   */
  extraAttributes: SchemaAttributes;

  /**
   * This is true when the extension is set to ignore extra attributes.
   */
  ignoreExtraAttributes: boolean;

  /**
   * The name for displaying in an error message. The name of the constructor is
   * used since it's more descriptive and easier to debug the error that may be
   * thrown if extra attributes are not applied correctly.
   */
  name: string;
}

interface CreateSpecReturn<Type> {
  /** The created spec. */
  spec: Type;

  /** The dynamic attribute creators for this spec */
  dynamic: Record<string, DynamicAttributeCreator>;
}

/**
 * Create the scheme spec for a node or mark extension.
 *
 * @typeParam Type - either a [[Mark]] or a [[ProsemirrorNode]]
 * @param parameter - the options object [[CreateSpecParameter]]
 */
function createSpec<Type>(parameter: CreateSpecParameter<Type>): CreateSpecReturn<Type> {
  const { createExtensionSpec, extraAttributes, ignoreExtraAttributes, name } = parameter;

  // Keep track of the dynamic attributes which are a part of this spec.
  const dynamic: Record<string, DynamicAttributeCreator> = object();

  /** Called for every dynamic creator to track the dynamic attributes */
  function addDynamic(attributeName: string, creator: DynamicAttributeCreator) {
    dynamic[attributeName] = creator;
  }

  // Used to track whether the method has been called. If not called when the
  // extension spec is being set up then an error is thrown.
  let defaultsCalled = false;

  /** Called by createDefaults to track when the `defaults` has been called. */
  function onDefaultsCalled() {
    defaultsCalled = true;
  }

  const defaults = createDefaults(
    extraAttributes,
    ignoreExtraAttributes,
    onDefaultsCalled,
    addDynamic,
  );

  const parse = createParseDOM(extraAttributes, ignoreExtraAttributes);
  const dom = createToDOM(extraAttributes, ignoreExtraAttributes);
  const spec = createExtensionSpec({ defaults, parse, dom });

  invariant(ignoreExtraAttributes || defaultsCalled, {
    code: ErrorConstant.EXTENSION_SPEC,
    message: `When creating a node specification you must call the 'defaults', and parse, and 'dom' methods. To avoid this error you can set the static property 'disableExtraAttributes' of '${name}' to 'true'.`,
  });

  return { spec, dynamic };
}

/**
 * Get the value of the extra attribute as an object.
 *
 * This is needed because the SchemaAttributes object can be configured as a
 * string or as an object.
 */
function getExtraAttributesObject(
  value: DynamicAttributeCreator | string | SchemaAttributesObject,
): SchemaAttributesObject {
  if (isString(value) || isFunction(value)) {
    return { default: value };
  }

  invariant(value, {
    message: `${toString(value)} is not supported`,
    code: ErrorConstant.EXTENSION_EXTRA_ATTRIBUTES,
  });

  return value;
}

/**
 * Create the `defaults()` method which is used for setting the property.
 *
 * @param extraAttributes - the extra attributes for this particular node
 * @param shouldIgnore - whether this attribute should be ignored
 * @param onCalled - the function which is called when this is run, to check
 * that it has been added to the attrs
 * @param addDynamic - A function called to add the dynamic creator and name to
 * the store
 */
function createDefaults(
  extraAttributes: SchemaAttributes,
  shouldIgnore: boolean,
  onCalled: () => void,
  addDynamicCreator: (name: string, creator: DynamicAttributeCreator) => void,
) {
  return () => {
    onCalled();
    const attributes: Record<string, { default?: string | null }> = object();

    // Extra attributes can be ignored by the extension, check if that's the
    // case here.
    if (shouldIgnore) {
      return attributes;
    }

    // Loop through the extra attributes and attach to the attributes object.
    for (const [name, config] of entries(extraAttributes)) {
      // Make sure this is an object and not a string.
      const attributesObject = getExtraAttributesObject(config);
      let defaultValue = attributesObject.default;

      // When true this is a dynamic attribute creator.
      if (isFunction(defaultValue)) {
        // Store the name and method of the dynamic creator.
        addDynamicCreator(name, defaultValue);

        // Set the attributes for this dynamic creator to be null by default.
        defaultValue = null;
      }

      // When the `defaultValue` is set to `undefined`, it is set as an empty
      // object in order for ProseMirror to set it as a required attribute.
      attributes[name] = defaultValue === undefined ? {} : { default: defaultValue };
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
 * Get the options object which applies should be used to obtain the node or
 * mark type.
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
       * the text direction should be right-to-left, or left-to-right.
       */
      createSchemaAttributes?(): IdentifierSchemaAttributes[];
    }
    interface BaseExtensionOptions {
      /**
       * Inject additional attributes into the defined mark / node schema. This
       * can only be used for `NodeExtensions` and `MarkExtensions`.
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
       * import { RemirrorManager } from 'remirror/core';
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
       * const manager = RemirrorManager.create([], { extraAttributes })
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
       * The value is created when the manager initializes. So it can be used in
       * `createCommands`, `createHelpers`, `createKeymap` and most of the
       * creator methods.
       */
      schema: EditorSchema;
    }

    interface StaticExtensionOptions {
      /**
       * When true will disable extra attributes for all instances of this
       * extension.
       *
       * @defaultValue `false`
       */
      readonly disableExtraAttributes?: boolean;
    }
  }
}
