import direction from 'direction';

import type {
  CreatePluginReturn,
  IdentifierSchemaAttributes,
  NodeAttributes,
  OnSetOptionsParameter,
  SchemaAttributesObject,
  Static,
} from '@remirror/core';
import {
  bool,
  extensionDecorator,
  findParentNode,
  hasTransactionChanged,
  isString,
  PlainExtension,
} from '@remirror/core';

export interface BidiOptions {
  /**
   * This is the direction that is used when the algorithm is not quite sure.
   */
  defaultDirection?: null | 'ltr' | 'rtl';

  /**
   * Whether or not the extension should automatically infer the direction as you type.
   *
   * @defaultValue `true`
   */
  autoUpdate?: boolean;

  /**
   * The names of the nodes to exclude.
   *
   * @defaultValue `[]`
   */
  excludeNodes?: Static<readonly string[]>;
}

/**
 * An extension which adds bi-directional text support to your editor.
 */
@extensionDecorator<BidiOptions>({
  defaultOptions: { defaultDirection: null, autoUpdate: true, excludeNodes: [] },
  staticKeys: ['excludeNodes'],
})
export class BidiExtension extends PlainExtension<BidiOptions> {
  get name() {
    return 'bidi' as const;
  }

  /**
   * Whether to ignore next updated.
   */
  #ignoreNextUpdate = false;

  /**
   * Add the bidi property to the top level editor attributes `doc`.
   */
  createAttributes(): NodeAttributes {
    if (this.options.defaultDirection) {
      return {
        dir: this.options.defaultDirection,
      };
    }

    return {};
  }

  /**
   * Add the `dir` to all the inner node types.
   */
  createSchemaAttributes = (): IdentifierSchemaAttributes[] => {
    const identifiers = this.store.nodeNames.filter(
      (name) => !this.options.excludeNodes.includes(name),
    );

    return [{ identifiers, attributes: { dir: this.dir() } }];
  };

  /**
   * Create the plugin that ensures the node has the correct `dir` value on each
   * state update.
   */
  createPlugin(): CreatePluginReturn<boolean> {
    return {
      state: {
        init: () => false,
        apply: (tr) => {
          if (this.#ignoreNextUpdate) {
            this.#ignoreNextUpdate = false;
            return false;
          }

          return hasTransactionChanged(tr);
        },
      },
      view: () => ({
        update: () => {
          const shouldUpdate = this.getPluginState<boolean>();
          const state = this.store.getState();
          const commands = this.store.getCommands();
          const { autoUpdate, excludeNodes } = this.options;

          if (!shouldUpdate || !autoUpdate) {
            return;
          }

          const parent = findParentNode({
            predicate: (node) =>
              bool(node.isTextblock && node.textContent && !excludeNodes.includes(node.type.name)),
            selection: state.selection,
          });

          if (!parent) {
            return;
          }

          const { node, pos } = parent;

          const currentDirection = node.attrs.dir;
          const dir = this.getDirection(node.textContent);

          if (currentDirection === dir) {
            return;
          }

          this.#ignoreNextUpdate = true;
          commands.updateNodeAttributes(pos, { ...node.attrs, dir });
        },
      }),
      props: {},
    };
  }

  protected onSetOptions(parameter: OnSetOptionsParameter<BidiOptions>) {
    const { changes } = parameter;

    if (changes.defaultDirection.changed) {
      this.store.updateAttributes();
    }
  }

  /**
   * Create the `SchemaAttributesObject`
   */
  private dir(): SchemaAttributesObject {
    return {
      default: this.options.defaultDirection,
      parseDOM: (element) => element.getAttribute('dir') ?? this.getDirection(element.textContent),
      toDOM: (_, { node }) => {
        if (!node) {
          return;
        }

        if (!node.textContent) {
          return;
        }

        return this.getDirection(node.textContent) ?? this.options.defaultDirection;
      },
    };
  }

  /**
   * Get the direction of the text.
   */
  private getDirection(text: string | undefined | null) {
    if (!isString(text)) {
      return;
    }

    const dir = direction(text);

    if (dir === 'neutral') {
      return this.options.defaultDirection;
    }

    return dir;
  }
}

declare global {
  namespace Remirror {
    interface ExtraNodeAttributes {
      /**
       * This attribute grants control over bidirectional language support.
       */
      dir?: 'ltr' | 'rtl';
    }
  }
}
