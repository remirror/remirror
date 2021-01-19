/**
 * Adapted from `@testing-library/events` to support more intuitive typing
 * within playwright tests for this project.
 *
 * The plan is to extract this into it's own project eventually.
 */

import delay from 'delay';
import { Page } from 'playwright';

import { isApple, selectAll } from './playwright-modifier-keys';

/**
 * Adapted from
 * https://github.com/testing-library/user-event/tree/c187639cbc7d2651d3392db6967f614a75a32695#typeelement-text-options
 *
 * Types text into the for the current editor.
 *
 * @param text - the text to type with support for special characters (see
 * below).
 * @param options - options which are supported by
 * `@testing-library/user-event`.
 *
 * ```ts
 * import { renderEditor } from 'jest-remirror';
 *
 * test('`keyBindings`', () => {
 *   renderEditor([])
 *     .add(doc(p('<cursor>')))
 *     .type('Hello,{enter}World!')
 *     .callback(content => {
 *       expect(content.state.doc).toEqualProsemirrorNode(doc(p('Hello,'), p('World')));
 *     });
 * });
 * ```
 *
 * #### Special characters
 *
 * The following special character strings are supported:
 *
 * | Text string   | Key       | Modifier   | Notes                                                                                                                                                               |
 * | ------------- | --------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
 * | `{enter}`     | Enter     | N/A        | Will insert a newline character (`<textarea />` only).                                                                                                              |
 * | `{space}`     | `' '`     | N/A        |                                                                                                                                                                     |
 * | `{esc}`       | Escape    | N/A        |                                                                                                                                                                     |
 * | `{backspace}` | Backspace | N/A        | Will delete the previous character (or the characters within the `selectedRange`, see example below).                                                               |
 * | `{del}`       | Delete    | N/A        | Will delete the next character (or the characters within the `selectedRange`, see example below)                                                                    |
 * | `{selectall}` | N/A       | N/A        | Selects all the text of the element. Note that this will only work for elements that support selection ranges (so, not `email`, `password`, `number`, among others) |
 * | `{shift}`     | Shift     | `shiftKey` | Does **not** capitalize following characters.                                                                                                                       |
 * | `{ctrl}`      | Control   | `ctrlKey`  |                                                                                                                                                                     |
 * | `{alt}`       | Alt       | `altKey`   |                                                                                                                                                                     |
 * | `{meta}`      | OS        | `metaKey`  |                                                                                                                                                                     |
 * | `{cmd}`       | OS        | `metaKey`  | Meta key for mac                                                                                                                                                    |
 * | `{mod}`       | OS        | `metaKey`  | Meta key on mac, Control on Windows.  |
 *
 *  **A note about modifiers:** Modifier keys (`{shift}`, `{ctrl}`, `{alt}`,
 * `{meta}`) will activate their corresponding event modifiers for the duration
 * of type command or until they are closed (via `{/shift}`, `{/ctrl}`, etc.).
 * If they are not closed explicitly, then events will be fired to close them
 * automatically (to disable this, set the `skipAutoClose` option to `true`).
 * <!-- space out these notes -->
 *
 * We take the same [stance as
 * Cypress](https://docs.cypress.io/api/commands/type.html#Modifiers) in that we
 * do not simulate the behavior that happens with modifier key combinations as
 * different operating systems function differently in this regard. An example
 * of an usage with a selection range:
 *
 * ```ts
 * import { renderEditor } from 'jest-remirror';
 *
 * test('`keyBindings`', () => {
 *   renderEditor([])
 *     .add(doc(p('Well, <start>content<end>')))
 *     .type('Hello{enter}World!')
 *     .callback(content => {
 *       expect(content.state.doc).toEqualProsemirrorNode(doc(p('Well, Hello'), p('World')));
 *     });
 * });
 * ```
 */
export const typist = createTypistAction({});

/**
 * Create your own `typist` with custom options applied.
 */
export function createTypistAction(options: TypistOptions = {}) {
  return async function typist(text: string): Promise<void> {
    for (const action of createActionQueue(text)) {
      await action(options);
    }
  };
}

interface TypistOptions {
  /**
   * Set a delay in `ms` when typing.
   *
   * @default undefined - no delay.
   */
  delay?: number;

  /**
   * Set to true to skip auto closing the event modifiers.
   */
  skipAutoClose?: boolean;

  /**
   * Provide a custom page object when not available globally.
   */
  page?: Page;
}

const modifierActions: Record<string, TypistAction> = {
  // Closable modifier tags.
  ...createCloseableAction('shift', 'Shift'),
  ...createCloseableAction('ctrl', 'Control'),
  ...createCloseableAction('alt', 'Alt'),
  ...createCloseableAction('meta', 'Meta'),
  ...createCloseableAction('mod', isApple() ? 'Meta' : 'Control'),
  ...createCloseableAction('cmd', 'Meta'),

  // General modifiers.
  '{selectall}': ({ delay }: TypistOptions) => selectAll({ delay }),
  '{capslock}': ({ delay }: TypistOptions) => page.keyboard.press('CapsLock', { delay }),
  '{arrowleft}': ({ delay }: TypistOptions) => page.keyboard.press('ArrowLeft', { delay }),
  '{arrowright}': ({ delay }: TypistOptions) => page.keyboard.press('ArrowRight', { delay }),
  '{arrowdown}': ({ delay }: TypistOptions) => page.keyboard.press('ArrowDown', { delay }),
  '{arrowup}': ({ delay }: TypistOptions) => page.keyboard.press('ArrowUp', { delay }),
  '{pagedown}': ({ delay }: TypistOptions) => page.keyboard.press('PageDown', { delay }),
  '{pageup}': ({ delay }: TypistOptions) => page.keyboard.press('PageUp', { delay }),
  '{home}': ({ delay }: TypistOptions) => page.keyboard.press('Home', { delay }),
  '{end}': ({ delay }: TypistOptions) => page.keyboard.press('End', { delay }),
  '{enter}': ({ delay }: TypistOptions) => page.keyboard.press('Enter', { delay }),
  '\n': ({ delay }: TypistOptions) => page.keyboard.press('Enter', { delay }),
  '\r': ({ delay }: TypistOptions) => page.keyboard.press('Enter', { delay }),
  '{tab}': ({ delay }: TypistOptions) => page.keyboard.press('Tab', { delay }),
  '{esc}': ({ delay }: TypistOptions) => page.keyboard.press('Escape', { delay }),
  '{del}': ({ delay }: TypistOptions) => page.keyboard.press('Delete', { delay }),
  '{backspace}': ({ delay }: TypistOptions) => page.keyboard.press('Backspace', { delay }),
  '{space}': ({ delay }: TypistOptions) => page.keyboard.press('Space', { delay }),
  ' ': ({ delay }: TypistOptions) => page.keyboard.press('Space', { delay }),
  '{f1}': ({ delay }: TypistOptions) => page.keyboard.press('F1', { delay }),
  '{f2}': ({ delay }: TypistOptions) => page.keyboard.press('F2', { delay }),
  '{f3}': ({ delay }: TypistOptions) => page.keyboard.press('F3', { delay }),
  '{f4}': ({ delay }: TypistOptions) => page.keyboard.press('F4', { delay }),
  '{f5}': ({ delay }: TypistOptions) => page.keyboard.press('F5', { delay }),
  '{f6}': ({ delay }: TypistOptions) => page.keyboard.press('F6', { delay }),
  '{f7}': ({ delay }: TypistOptions) => page.keyboard.press('F7', { delay }),
  '{f8}': ({ delay }: TypistOptions) => page.keyboard.press('F8', { delay }),
  '{f9}': ({ delay }: TypistOptions) => page.keyboard.press('F9', { delay }),
  '{f10}': ({ delay }: TypistOptions) => page.keyboard.press('F10', { delay }),
  '{f11}': ({ delay }: TypistOptions) => page.keyboard.press('F11', { delay }),
  '{f12}': ({ delay }: TypistOptions) => page.keyboard.press('F12', { delay }),
};

function createCloseableAction(name: string, key: string): Record<string, TypistAction> {
  const openTag = `{${name}}`;
  const closeTag = `{/${name}}`;

  async function open(options: TypistOptions) {
    await page.keyboard.down(key);
    return options.delay ? delay(options.delay) : undefined;
  }

  async function close(options: TypistOptions) {
    await page.keyboard.up(key);
    return options.delay ? delay(options.delay) : undefined;
  }

  open.closingTag = closeTag;

  return {
    [openTag]: open,
    [closeTag]: close,
  };
}

interface TypistAction {
  closingTag?: string;
  (options: TypistOptions): Promise<void>;
}

/**
 * A generator that yields the actions for each action without the need for an
 * array.
 */
function* createActionQueue(text: string) {
  while (text) {
    const value = getAction(text);
    text = value.text;

    yield value.action;
  }
}

interface GetActionReturn {
  action: TypistAction;
  text: string;
}

function getAction(text: string): GetActionReturn {
  const value = Object.entries(modifierActions).find(([tag]) => text.startsWith(tag));

  if (value) {
    const [tag, action] = value;

    // If this modifier has an associated "close" callback and the developer
    // doesn't close it themselves, then we close it for them automatically
    // Effectively if they send in: '{alt}a' then we type: '{alt}a{/alt}'
    if (action.closingTag && !text.includes(action.closingTag)) {
      text += action.closingTag;
    }

    return { action, text: text.slice(tag.length) };
  }

  const character = text[0] ?? '';

  return {
    action: ({ delay }) => page.keyboard.type(character, { delay }),
    text: text.slice(1),
  };
}
