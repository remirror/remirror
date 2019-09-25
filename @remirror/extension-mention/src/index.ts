/**
 * ## The problem
 *
 * You'd love a simpler way to create **editable** `@` and `#` mentions with
 * suggestions built into your `remirror` editor. Or perhaps you'd prefer
 * non-editable mentions that create an inline prosemirror node. Or maybe you're
 * keeping it simple and decide that you want mentions to output plain text into
 * your markdown editor.
 *
 * ## The solution
 *
 * `@remirror/extension-mention` exports three `remirror` extensions for
 * managing **editable** `Mark` mentions, non-editable `Node` mentions and plain
 * text mentions. Underneath the work is being done by `prosemirror-suggest` to
 * reduce the boilerplate needed to setup.
 *
 *
 * ## Installation
 *
 * After completing the installation of the the `remirror` environment as shown
 * in the [docs](https://docs.remirror.org/install) run the following command.
 *
 * ```bash
 * yarn add @remirror/extension-mention`
 * ```
 *
 * ## Getting started
 *
 * @packageDocumentation
 */

export * from './mention-extension';
export * from './mention-types';
