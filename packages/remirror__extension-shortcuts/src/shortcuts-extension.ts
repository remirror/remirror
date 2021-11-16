import { extension, InputRule, PlainExtension, plainInputRule } from '@remirror/core';

export interface ShortcutsOptions {}

const SHORTCUTS: Array<[RegExp, string]> = [
  // Dash
  [/--$/, '—'],
  // ellipsis
  [/\.{3}$/, '…'],
  // openDoubleQuote
  [/(?:^|[\s"'(<[{\u2018\u201C])(")$/, '“'],
  // closeDoubleQuote
  [/"$/, '”'],
  // openSingleQuote
  [/(?:^|[\s"'(<[{\u2018\u201C])(')$/, '‘'],
  // closeSingleQuote
  [/'$/, '’'],
  // leftArrow
  [/<-$/, '←'],
  // rightArrow
  [/->$/, '→'],
  // copyright
  [/\(c\)$/, '©'],
  // trademark
  [/\(tm\)$/, '™'],
  // registeredTrademark
  [/\(r\)$/, '®'],
  // oneHalf
  [/1\/2$/, '½'],
  // plusMinus
  [/\+\/-$/, '±'],
  // notEqual
  [/!=$/, '≠'],
  // laquo
  [/<<$/, '«'],
  // raquo
  [/>>$/, '»'],
  // multiplication
  [/\d+\s?([*x])\s?\d+$/, '×'],
  // superscriptTwo
  [/\^2$/, '²'],
  // superscriptThree
  [/\^3$/, '³'],
  // oneQuarter
  [/1\/4$/, '¼'],
  // threeQuarters
  [/3\/4$/, '¾'],
];

/**
 * Replace characters with keyboard shortcuts
 *
 * Inspired by Tiptap's extension-typography
 */
@extension<ShortcutsOptions>({
  defaultOptions: {},
})
export class ShortcutsExtension extends PlainExtension<ShortcutsOptions> {
  get name() {
    return 'shortcuts' as const;
  }

  /**
   * Manage input rules for emoticons.
   */
  createInputRules(): InputRule[] {
    return SHORTCUTS.map(([regexp, replace]) => {
      // Replace emoticons
      return plainInputRule({
        regexp,
        transformMatch: () => replace,
      });
    });
  }
}

declare global {
  namespace Remirror {
    interface AllExtensions {
      template: ShortcutsExtension;
    }
  }
}
