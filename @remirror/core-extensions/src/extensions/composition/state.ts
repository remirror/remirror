import { EditorState, EditorView, Transaction } from '@remirror/core';
import { Selection } from 'prosemirror-state';

/**
 * Manages the composition state of the editor.
 */
export class CompositionState {
  public deleteInProgress: boolean = false;
  public decorationTicks = 0;
  public active = false;
  public selection?: Selection;
  public lastTransactionFiltered = false;
  // public setViewFocus = false;
  private view!: EditorView;

  public init(view: EditorView) {
    this.view = view;
    return this;
  }

  public startDelete() {
    // console.log('starting delete');
    this.deleteInProgress = true;
    this.active = true;
    return this;
  }

  public endDelete(selection: Selection) {
    // console.log('ending delete');
    this.deleteInProgress = false;
    this.selection = selection;
    return this;
  }

  private resetState() {
    // console.log('resetting the compositionState');
    this.active = false;
    this.deleteInProgress = false;
    this.selection = undefined;
    this.lastTransactionFiltered = false;
    // this.setViewFocus = false;
    return this;
  }

  public apply() {
    if (this.lastTransactionFiltered) {
      // console.log('apply: resetting state in apply');
      this.resetState();
      // console.log('apply: dispatching state selection');
      // this.view.dispatch(tr.setSelection(state.selection));
    }
    return this;
  }

  public appendTransaction(transactions: Transaction[]) {
    if (this.lastTransactionFiltered) {
      return undefined;
    }
    if (transactions.length !== 1) {
      return undefined;
    }
    const tr = transactions[0];
    if (!tr.steps.length && this.active && !this.deleteInProgress && this.selection) {
      // console.log('appendTransaction: resetting state');
      // this.resetState();
      // console.log('appendTransaction: setting lastTransactionFiltered=true');
      this.lastTransactionFiltered = true;
      // console.log('appendTransaction: dispatching the stored selection');
      // this.view.dispatch(tr.setSelection(this.selection));
      // console.log('appendTransaction: returning transaction');
      return tr.setSelection(this.selection);
    }
    return undefined;
  }

  // TODO use this instead of append transaction but this time filter the transaction which
  // happens while the delete is in progress (return false) and see if that prevents the extra delete on android devices
  public filterTransaction(tr: Transaction) {
    if (this.lastTransactionFiltered) {
      return true;
    }
    if (!tr.steps.length && this.active && !this.deleteInProgress && this.selection) {
      // console.log('filterTransaction: setting lastTransactionFiltered=true');
      this.lastTransactionFiltered = true;
      // console.log('filterTransaction: dispatching the stored selection');
      this.view.dispatch(tr.setSelection(this.selection));
      // console.log('filterTransaction: resetting state');
      this.resetState();
      // this.setViewFocus = true;
      // console.log('filterTransaction: focusing the view');
      // this.view.focus();
      // console.log('filterTransaction: returning false');
      // return false;
    }
    return true;
  }

  public viewUpdate() {
    // if (this.setViewFocus) {
    //   // console.log('viewUpdate: setting view focus', this.view.hasFocus());
    //   if (this.view.hasFocus()) {
    //     return;
    //     // (this.view.dom as HTMLElement).blur();
    //   }
    //   this.view.focus();
    //   this.view.dispatch(this.view.state.tr.setSelection(this.selection!));
    //   this.resetState();
    // }
  }

  public decoration(_state: EditorState) {
    // const { doc, selection } = state;
    // const { $from } = selection;
    // if (!nodeNameMatchesList($from.nodeBefore, ['emoji'])) {
    //   // console.log('not emoji before');
    //   this.decorationTicks = 0;
    //   return null;
    // }
    // if (this.deleteInProgress) {
    //   // console.log('delete in progress');
    //   this.decorationTicks = 2;
    // }
    // if (this.decorationTicks > 0) {
    //   // console.log('decoration: being added');
    //   this.decorationTicks--;
    //   const node = document.createElement('span');
    //   node.appendChild(document.createTextNode(ZERO_WIDTH_SPACE_CHAR));
    //   const decoration = Decoration.widget($from.pos, node, {
    //     raw: true,
    //     side: 1,
    //   } as any);
    //   return DecorationSet.create(doc, [decoration]);
    // }
    // console.log('decoration: being removed');
    return null;
  }
}
