import { EditorView, Transaction } from '@remirror/core-types';
import { Selection } from 'prosemirror-state';

/**
 * Manages the composition state of the editor.
 *
 * TODO verify that this is still necessary with `prosemirror-view@1.9.0`
 */
export class CompositionState {
  public deleteInProgress: boolean = false;
  public decorationTicks = 0;
  public active = false;
  public selection?: Selection;
  public lastTransactionFiltered = false;
  private view!: EditorView;

  /**
   * Used to store a reference to the view. This is necessary because the plugin state
   * is constructed within the prosemirror `state.init` which doesn't yet have access to the view.
   *
   * This should be called from within the view hook in the prosemirror plugin.
   *
   * @param view - the editor view
   */
  public init(view: EditorView) {
    this.view = view;
    return this;
  }

  /**
   * Used to indicated a delete is now in progress
   */
  public startDelete() {
    this.deleteInProgress = true;
    this.active = true;
    return this;
  }

  /**
   * Used to indicated that a delete has now finished.
   *
   * @param selection - the current selection
   */
  public endDelete(selection: Selection) {
    this.deleteInProgress = false;
    this.selection = selection;
    return this;
  }

  /**
   * Reset the state of the plugin to it's initial settings.
   */
  public resetState() {
    this.active = false;
    this.deleteInProgress = false;
    this.selection = undefined;
    this.lastTransactionFiltered = false;
    return this;
  }

  /**
   * Used in the plugin to reset the state after a transaction has been filtered
   */
  public apply() {
    if (this.lastTransactionFiltered) {
      this.resetState();
    }
    return this;
  }

  /**
   * Appends a transaction  to the state only when there is a selection and the composition delete has finished.
   *
   * @param transactions - a list of transactions
   */
  public appendTransaction(transactions: Transaction[]) {
    if (this.lastTransactionFiltered) {
      return undefined;
    }
    if (transactions.length !== 1) {
      return undefined;
    }
    const tr = transactions[0];
    if (!tr.steps.length && this.active && !this.deleteInProgress && this.selection) {
      this.lastTransactionFiltered = true;
      return tr.setSelection(this.selection);
    }
    return undefined;
  }

  /**
   * Currently this is not in use but should be tested to see if it works
   *
   * TODO use this instead of append transaction but this time filter the transaction which
   * happens while the delete is in progress (return false) and see if that prevents the extra
   * delete on android devices
   *
   * @param tr - a prosemirror transaction
   */
  public filterTransaction(tr: Transaction) {
    if (this.lastTransactionFiltered) {
      return true;
    }

    if (!tr.steps.length && this.active && !this.deleteInProgress && this.selection) {
      this.lastTransactionFiltered = true;
      this.view.dispatch(tr.setSelection(this.selection));
      this.resetState();
    }
    return true;
  }
}
