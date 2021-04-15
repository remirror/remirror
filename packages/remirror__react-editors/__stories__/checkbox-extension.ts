import {
  ApplySchemaAttributes,
  extension,
  ExtensionTag,
  InputRule,
  NodeExtension,
  NodeExtensionSpec,
  NodeSpecOverride,
  ProsemirrorAttributes,
} from 'remirror';
import { textblockTypeInputRule } from '@remirror/pm/inputrules';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface CheckboxOptions {}

// eslint-disable-next-line @typescript-eslint/ban-types
export type CheckboxExtensionAttributes = ProsemirrorAttributes<{
  checked?: boolean;
}>;

@extension<CheckboxOptions>({
  defaultOptions: {},
})
export class CheckboxExtension extends NodeExtension<CheckboxOptions> {
  get name() {
    return 'checkbox' as const;
  }

  createTags() {
    return [ExtensionTag.Block, ExtensionTag.TextBlock, ExtensionTag.FormattingNode];
  }

  createNodeSpec(extra: ApplySchemaAttributes, override: NodeSpecOverride): NodeExtensionSpec {
    return {
      content: 'inline*',
      defining: true,
      draggable: false,
      ...override,
      attrs: {
        ...extra.defaults(),
        checked: { default: false },
      },
      parseDOM: [
        {
          tag: 'input[type=checkbox]',
          getAttrs: (dom) => {
            return {
              ...extra.parse(dom),
              checked: (dom as HTMLInputElement).checked,
            };
          },
        },
        ...(override.parseDOM ?? []),
      ],
      toDOM: (mark) => {
        return [
          'label',
          extra.dom(mark),
          [
            'input',
            {
              type: 'checkbox',
              checked: mark.attrs.checked,
            },
            0,
          ],
        ];
      },
    };
  }

  createInputRules(): InputRule[] {
    return [
      textblockTypeInputRule(/^\s*\[]\s$/, this.type, { checked: false }),
      textblockTypeInputRule(/^\s*\[x]\s$/, this.type, { checked: true }),
    ];
  }
}
