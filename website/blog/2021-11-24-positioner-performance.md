---
slug: positioner-performance
title: Performance boost for Remirror positioners
author: Ronny Roeller
author_title: Remirror Maintainer
author_url: https://github.com/ronnyroeller
author_image_url: https://avatars.githubusercontent.com/u/9339055?v=4
tags: [remirror, tip, styling]
---

_TLDR: Debounce user input to prevent lag when using positioners with Remirror (Prosemirror)_

<!-- truncate -->

Positioners are one of Remirror’s power features: They make it easy to position content relative to text in the editor. From bubble menus over the selected text, to showing comments in a sidebar at the height as the commented text — the sky is the limit.

In fact, there is actually a limit: By default, Remirror recalculates positioner locations on every doc or selection change (i.e. every keypress or mouse click). If your positioner renders a complex React component, **users can experience a significant lag while typing**. A highly disturbing user experience!

Faced with such a lag, we found an interesting solution to prevent the positioning logic from being re-executed on each user stroke: **We debounce the rendering of the positioner, to ensure it only re-renders once the user has finished typing.**

That’s how it works: If the user types a character in the editor, we wait 500ms to see if the user enters another character. If the user enters another character, we reset the timer and wait again 500ms. Once the user stops typing, we finally recalculate the positioner.

One challenge with debouncing selection updates is when the user clicks in a different part of the editor. For example, a bubble menu would have a noticable delay until it jumped from its old — obsolete — position to the new cursor position. To prevent that, we check if the new selection is close to the old selection. If not, we skip the debouncing, and immediately update the positioner.

If you want to implement debouncing for your own positioners, here is a sketch to get you started:

```typescript
const AVERAGE_WORD_LENGTH = 5;
const debouncedSelectionUpdate = createDebouncedUpdate(250);
const debouncedDocUpdate = createDebouncedUpdate(500);
export const debouncedPositioner = Positioner.fromPositioner(
 selectionPositioner,
 {
  // Redrawing positioners is expensive, and can lead to jank.
  // Crucially, typing can feel very laggy.
  // To prevent this, we only re-render the popup when the user
  // finished their keyboard/mouse input.
  hasChanged: ({ state, previousState, tr, helpers }) => {
   if (isForcedDebouncedUpdate(tr)) {
    // This forces the positioner to re-render, when the burst of
    // debounced transactions have completed
    return true;
   } else if (tr?.selectionSet) {
    // Only once the selection is final, shall the positioner state
    // be reevalulated.
    // This avoids jank while the user is selecting text (or
    // clicking around in the text).
    const { from, empty } = state.selection;
    const { from: prevFrom = 0 } = previousState?.selection ?? {};
    // If click position is very different from the last, don't
    // debounce
    if (empty && Math.abs(prevFrom - from) > AVERAGE_WORD_LENGTH) {
     return true;
    }
    // Allow for triple clicks (select entire paragraph)
    debouncedSelectionUpdate(helpers.getCommandProp);
    return false;
   } else if (tr?.docChanged) {
    // Debounce doc updates, (i.e. user typing) until they are
    // complete.
    // This avoids lag while the user is typing.
    // We can't use the old state once the delay passed because that
    // state might be outdated (e.g. collab editing). To work around
    // that, getCommandProp() grants access to the current Remirror
    // state.
    debouncedDocUpdate(helpers.getCommandProp);
    return false;
   }
   // Some other transaction reason, return false to prevent render
   // Hint for debugging: Check the keys of the (private) `tr.meta`
   // to understand what happened
   return false;
  },
  ...
```

And here are the helpers to send debouncing transactions:

```typescript
import { debounce } from 'remirror';
import type { CommandFunctionProps, Transaction } from 'remirror';
/**
 * When we debounce positioner re-rendering, we need to trigger an
 * update at the end of a burst of activity to actually update the
 * view. We use this meta key to bail out of debounce logic, and
 * force the positioners to re-render.
 * @see isForcedDebouncedUpdate
 */
const DEBOUNCED_POSITIONER_UPDATE = 'debouncedPositionerUpdate';
export type GetCommandPropsCallback = () => CommandFunctionProps;
const forceUpdate = (cb: GetCommandPropsCallback): void => {
  const { view, tr } = cb();
  view?.dispatch(tr.setMeta(DEBOUNCED_POSITIONER_UPDATE, {}));
};
/**
 * Create a transaction that will force positioners to re-render,
 * but debounce it so that it will only be fired once at the end (or
 * optionally beginning) of a burst of activity (i.e. multiple key
 * presses while typing)
 * @param ms
 * @param atBegin - If true, re-render will be at beginning of
 * burst, instead of end
 */
export function createDebouncedUpdate(ms: number, atBegin = false) {
  return debounce(ms, atBegin, forceUpdate);
}
/**
 * Helps determine if this transaction is a forced positioner update
 * @param tr - A ProseMirror transaction
 */
export function isForcedDebouncedUpdate(tr?: Transaction): boolean {
  return Boolean(tr?.getMeta(DEBOUNCED_POSITIONER_UPDATE));
}
```

Happy coding!

_This post was originally published on [Medium](https://medium.com/collaborne-engineering/performance-boost-for-remirror-positioners-1e9feead2d17)._
