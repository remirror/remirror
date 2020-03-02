import { EditorState , TextSelection, Transaction } from "prosemirror-state"
import { Node as ProsemirrorNode , NodeType } from "prosemirror-model"
import { KeyBindings, convertCommand } from "@remirror/core"

export function selectedTableCell(state: EditorState): ProsemirrorNode | null {
    const fromCell: ProsemirrorNode = state.selection.$from.parent
    const toCell: ProsemirrorNode = state.selection.$to.parent

    if (
        fromCell.type.name === "tableCell" &&
        toCell.type.name === "tableCell" &&
        fromCell === toCell
    ) {
        return fromCell
    }

    return null
}

export function buildBlockEnterKeymapBindings(
    regex: RegExp,
    nodeType: NodeType,
    options: {
        getAttrs?: (match: string[]) => { [name: string]: string }
        transact?: (match: string[], tr: Transaction, start: number, end: number) => Transaction
    },
): KeyBindings {
    // https://github.com/ProseMirror/prosemirror/issues/374#issuecomment-224514332
    // https://discuss.prosemirror.net/t/trigger-inputrule-on-enter/1118/4
    return {
        Enter: convertCommand((state, dispatch) => {
            // Some code is copy from prosemirror-inputrules/src/inputrules.js
            if (!(state.selection instanceof TextSelection)) {
                return false
            }
            const { nodeBefore } = state.selection.$from
            if (!nodeBefore || !nodeBefore.isText) {
                return false
            }
            const cursor = state.selection.$cursor
            const match = regex.exec(nodeBefore.text ?? "")
            if (match && cursor) {
                const [start, end] = [cursor.pos - match[0].length, cursor.pos]
                // copy from `textblockTypeInputRule`
                const $start = state.doc.resolve(start)
                if (
                    !$start
                        .node(-1)
                        .canReplaceWith($start.index(-1), $start.indexAfter(-1), nodeType)
                ) {
                    return false
                }

                let tr: Transaction = state.tr
                if (options.getAttrs) {
                    tr = tr
                        .delete(start, end)
                        .setBlockType(start, start, nodeType, options.getAttrs(match))
                }
                if (options.transact) {
                    tr = options.transact(match, tr, start, end)
                }
                if (dispatch) {
                    // To be able to query whether a command is applicable for a given state, without
                    // actually executing it, the `dispatch` argument is optional—commands should
                    // simply return true without doing anything when they are applicable but no
                    // `dispatch` argument is given
                    // https://prosemirror.net/docs/guide/#commands
                    dispatch(tr)
                }
                return true
            }
            return false
        }),
    }
}
