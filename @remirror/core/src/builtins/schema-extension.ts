import { AttributeSpec, ParseRule, Schema } from 'prosemirror-model';

import { ExtensionPriority } from '@remirror/core-constants';
import { freeze, isArray, isFunction, isString, object } from '@remirror/core-helpers';
import {
  CreateExtraAttributes,
  EditorSchema,
  ExtraAttributes,
  GetExtraAttributes,
  MarkExtensionSpec,
  NodeExtensionSpec,
  ProsemirrorAttributes,
} from '@remirror/core-types';
import { isElementDOMNode } from '@remirror/core-utils';

import {
  AnyExtension,
  ExtensionFactory,
  GetMarkNameUnion,
  GetNodeNameUnion,
  isMarkExtension,
  isNodeExtension,
  SchemaFromExtension,
} from '../extension';

/**
 * Automatically set the default attributes and also parse the extra attributes .
 */
function transformSchemaAttributes<
  Spec extends { parseDOM?: ParseRule[] | null; attrs?: { [name: string]: AttributeSpec } | null }
>(extraAttributes: ExtraAttributes[], spec: Readonly<Spec>): Readonly<Spec> {
  const { parseDOM: originalParseDom, attrs: originAttrs, ...rest } = spec;

  const defaultExtraAttributes: CreateExtraAttributes = (parameter) => {
    const { fallback = null } = parameter ?? {};

    const attributes: Record<string, AttributeSpec> = object();

    for (const item of extraAttributes) {
      if (isArray(item)) {
        attributes[item[0]] = { default: item[1] };
        continue;
      }

      if (isString(item)) {
        attributes[item] = { default: fallback };
        continue;
      }

      const { name, default: def } = item;
      attributes[name] = def !== undefined ? { default: def } : {};
    }

    return attributes;
  };

  const attrs = { ...defaultExtraAttributes(), ...originAttrs };

  const parseExtraAttributes: GetExtraAttributes = (domNode) => {
    const attributes: ProsemirrorAttributes = object();

    if (!isElementDOMNode(domNode)) {
      return attributes;
    }

    for (const attribute of extraAttributes) {
      if (isArray(attribute)) {
        // Use the default
        const [name, , attributeName] = attribute;
        attributes[name] = attributeName
          ? (domNode as Element).getAttribute(attributeName)
          : undefined;

        continue;
      }

      if (isString(attribute)) {
        // Assume the name is the same
        attributes[attribute] = (domNode as Element).getAttribute(attribute);
        continue;
      }

      const { name, getAttribute, default: fallback } = attribute;
      attributes[name] = getAttribute ? getAttribute(domNode) || fallback : fallback;
    }

    return attributes;
  };

  const parseDOM = originalParseDom
    ? originalParseDom.map((parseRule) => {
        const prevGetAttrs = parseRule.getAttrs;

        if (!isFunction(prevGetAttrs)) {
          return parseRule;
        }

        const getAttrs: NonNullable<ParseRule['getAttrs']> = (domNode) => {
          const attrs = prevGetAttrs(domNode);

          if (attrs) {
            return { ...parseExtraAttributes(domNode), ...attrs };
          }

          return attrs;
        };

        return { ...parseRule, getAttrs };
      })
    : originalParseDom;

  return freeze({ ...rest, attrs, parseDOM }) as Spec;
}

/**
 * This extension creates the schema that is used throughout the rest of the
 * extension.
 *
 * @builtin
 */
export const SchemaExtension = ExtensionFactory.plain({
  name: 'schema',

  /**
   * This extension is essential and hence the priority is set to high.
   */
  defaultPriority: ExtensionPriority.High,

  onCreate(parameter) {
    const { managerSettings } = parameter;
    const nodes: Record<string, NodeExtensionSpec> = object();
    const marks: Record<string, MarkExtensionSpec> = object();
    const extraAttributes: Record<string, ExtraAttributes[]> = object();

    for (const attributeGroup of managerSettings.schemaAttributes ?? []) {
      for (const identifier of attributeGroup.identifiers) {
        const currentValue = extraAttributes[identifier] ?? [];
        extraAttributes[identifier] = [...currentValue, ...attributeGroup.attributes];
      }
    }

    return {
      beforeExtensionLoop() {
        const { setDefaultExtensionSettings } = parameter;

        // Set default extraAttributes on every extension to be empty array
        setDefaultExtensionSettings('extraAttributes', []);
      },

      forEachExtension(extension) {
        const currentAttributes = extraAttributes[extension.name];
        extraAttributes[extension.name] = [
          ...currentAttributes,
          ...extension.settings.extraAttributes,
        ];

        if (isNodeExtension(extension)) {
          const { name, schema } = extension;
          nodes[name] = transformSchemaAttributes(extraAttributes[extension.name], schema);
        }

        if (isMarkExtension(extension)) {
          const { name, schema } = extension;

          marks[name] = transformSchemaAttributes(extraAttributes[extension.name], schema);
        }
      },

      afterExtensionLoop() {
        const { setStoreKey, setManagerMethodParameter, getStoreKey } = parameter;

        const schema = new Schema({ nodes, marks });

        setStoreKey('nodes', nodes);
        setStoreKey('marks', marks);
        setStoreKey('schema', schema);
        setManagerMethodParameter('schema', () => getStoreKey('schema'));
      },
    };
  },
});

/**
 * The interface for adding extra attributes to multiple node and mark extensions.
 */
export interface ExtraSchemaAttributes {
  /**
   * The string identifiers for the extension.
   */
  identifiers: string[];

  /**
   * The attributes to be added.
   */
  attributes: ExtraAttributes[];
}

declare global {
  namespace Remirror {
    interface BaseExtensionSettings {
      /**
       * Inject additional attributes into the defined mark / node schema. This can
       * only be used for `NodeExtensions` and `MarkExtensions`.
       *
       * @remarks
       *
       * Sometimes you need to add additional attributes to a node or mark. This
       * property enables this without needing to create a new extension.
       *
       * - `extraAttributes: ['title']` Create an attribute with name `title`.When
       *   parsing the dom it will look for the attribute `title`
       * - `extraAttributes: [['custom', 'false', 'data-custom'],'title']` - Creates an
       *   attribute with name `custom` and default value `false`. When parsing the
       *   dom it will look for the attribute `data-custom`
       *
       * @defaultValue `[]`
       */
      extraAttributes?: ExtraAttributes[];
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
       * ```
       */
      schemaAttributes?: ExtraSchemaAttributes[];
    }

    interface ManagerStore<ExtensionUnion extends AnyExtension = any> {
      /**
       * The nodes to place on the schema.
       */
      nodes: Record<GetNodeNameUnion<ExtensionUnion>, NodeExtensionSpec>;

      /**
       * The marks to be added to the schema.
       */
      marks: Record<GetMarkNameUnion<ExtensionUnion>, MarkExtensionSpec>;

      /**
       * The schema created by this extension manager.
       */
      schema: SchemaFromExtension<ExtensionUnion>;
    }

    interface ManagerMethodParameter<Schema extends EditorSchema = EditorSchema> {
      /**
       * The Prosemirror schema being used for the current interface
       */
      schema: () => Schema;
    }
  }
}
