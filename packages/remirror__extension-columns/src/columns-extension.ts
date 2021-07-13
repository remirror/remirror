import {
  ApplySchemaAttributes,
  command,
  CommandFunction,
  extension,
  ExtensionTag,
  IdentifierSchemaAttributes,
  isElementDomNode,
  joinStyles,
  LiteralUnion,
  NodeExtension,
  NodeExtensionSpec,
  NodeSpecOverride,
  omitExtraAttributes,
  PrimitiveSelection,
  ProsemirrorAttributes,
  SchemaAttributesObject,
  Static,
} from '@remirror/core';
import { ExtensionColumnsMessages as Messages } from '@remirror/messages';

export const toggleColumnsOptions: Remirror.CommandDecoratorOptions = {
  icon: ({ attrs }) => ({ name: 'layoutColumnLine', sup: attrs?.count as string }),
  label: ({ t, attrs }) => t(Messages.LABEL, { count: attrs?.count }),
  description: ({ t, attrs }) => t(Messages.DESCRIPTION, { count: attrs?.count }),
};

export const DEFAULT_COLUMN_ATTRIBUTES: Required<BaseColumnAttributes> = {
  count: 2,
  fill: 'auto',
  gap: 'inherit',
  ruleColor: 'inherit',
  ruleStyle: 'none',
  ruleWidth: 'inherit',
  width: 'inherit',
};
const COLUMN_DATA_ATTRIBUTE = 'data-column-type';

export interface ColumnsOptions {
  /**
   * The default columns to use for created columns.
   *
   * @default `DEFAULT_COLUMN_ATTRIBUTES`
   */
  defaults?: Static<Required<BaseColumnAttributes>>;
}

export interface BaseColumnAttributes {
  /**
   * Specifies the number of columns an element should be divided into.
   *
   * @default 2
   */
  count?: number;

  /**
   * Specifies how to fill columns.
   *
   * @default 'auto'
   */
  fill?: 'balance' | 'auto';

  /**
   * Specifies the gap between the columns.
   *
   * @default 'inherit'
   */
  gap?: string;

  /**
   * Specifies the color of the rule between columns.
   *
   * @default 'transparent'
   */
  ruleColor?: string;

  /**
   * Specifies the style of the rule between columns.
   *
   * @default 'none'
   */
  ruleStyle?:
    | 'none'
    | 'hidden'
    | 'dotted'
    | 'dashed'
    | 'solid'
    | 'double'
    | 'groove'
    | 'ridge'
    | 'inset'
    | 'outset';

  /**
   * Specifies the width of the rule between columns.
   *
   * @default 'inherit'
   */
  ruleWidth?: LiteralUnion<'medium' | 'thin' | 'thick', string>;

  /**
   * Specifies a suggested, optimal width for the columns.
   *
   * @default 'inherit'
   */
  width?: string;
}

export type ColumnAttributes = ProsemirrorAttributes<BaseColumnAttributes>;

/**
 * Add column support to the nodes in your editor.
 */
@extension<ColumnsOptions>({
  defaultOptions: {
    defaults: DEFAULT_COLUMN_ATTRIBUTES,
  },
  staticKeys: ['defaults'],
})
export class ColumnsExtension extends NodeExtension<ColumnsOptions> {
  get name() {
    return 'columns' as const;
  }

  createTags() {
    return [ExtensionTag.Block];
  }

  createNodeSpec(extra: ApplySchemaAttributes, override: NodeSpecOverride): NodeExtensionSpec {
    return {
      ...override,
      content: 'block+',
      attrs: {
        ...extra.defaults(),
        count: { default: this.options.defaults.count },
        fill: { default: this.options.defaults.fill },
        gap: { default: this.options.defaults.gap },
        ruleColor: { default: this.options.defaults.ruleColor },
        ruleStyle: { default: this.options.defaults.ruleStyle },
        ruleWidth: { default: this.options.defaults.ruleWidth },
        width: { default: this.options.defaults.width },
      },
      parseDOM: [
        {
          tag: `div[${COLUMN_DATA_ATTRIBUTE}]`,
          getAttrs: (node) => {
            if (!isElementDomNode(node)) {
              return false;
            }

            const {
              columnCount,
              columnFill,
              columnGap,
              columnRuleColor,
              columnRuleStyle,
              columnRuleWidth,
              columnWidth,
            } = node.style;

            return {
              ...extra.parse(node),
              count: columnCount,
              fill: columnFill,
              gap: columnGap,
              ruleColor: columnRuleColor,
              ruleStyle: columnRuleStyle,
              ruleWidth: columnRuleWidth,
              width: columnWidth,
            };
          },
        },
        ...(override.parseDOM ?? []),
      ],
      toDOM: (node) => {
        const { count, fill, gap, ruleColor, ruleStyle, ruleWidth, width, ...other } =
          omitExtraAttributes<Required<ColumnAttributes>>(node.attrs, extra);
        const { style: currentStyle = '', ...rest } = extra.dom(node);
        const style = joinStyles(
          {
            columnCount: count,
            columnFill: fill,
            columnGap: gap,
            columnRuleColor: ruleColor,
            columnRuleStyle: ruleStyle,
            columnRuleWidth: ruleWidth,
            columnWidth: width,
          },
          currentStyle,
        );
        const attributes = { ...rest, ...other, style, [COLUMN_DATA_ATTRIBUTE]: 'true' };

        return ['div', attributes, 0];
      },
    };
  }

  /**
   * Add a column span attribute to all block nodes within the editor.
   */
  createSchemaAttributes(): IdentifierSchemaAttributes[] {
    const columnSpan: SchemaAttributesObject = {
      default: null,
      parseDOM: (node) => node.getAttribute('column-span') ?? 'none',
      toDOM: (attrs) => {
        return attrs.columnSpan
          ? ['column-span', attrs.columnSpan === 'all' ? 'all' : 'none']
          : null;
      },
    };

    return [
      {
        identifiers: {
          tags: [ExtensionTag.Block],
          type: 'node',
          excludeNames: ['columns'],
        },
        attributes: { columnSpan },
      },
    ];
  }

  /**
   * Toggle a column wrap around the content.
   */
  @command(toggleColumnsOptions)
  toggleColumns(attrs: ColumnAttributes = {}, options: ToggleColumnsOptions = {}): CommandFunction {
    return this.store.commands.toggleWrappingNode.original(this.type, attrs, options.selection);
  }
}

interface ToggleColumnsOptions {
  selection?: PrimitiveSelection;
}

declare global {
  namespace Remirror {
    interface Attributes {
      /**
       * The number of columns that a node should span across. This only comes
       * into effect if the block node is within a column node.
       */
      columnSpan?: 'none' | 'all';
    }

    interface AllExtensions {
      columns: ColumnsExtension;
    }
  }
}
