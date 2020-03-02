import { Decoration, DecorationSet } from "prosemirror-view"
import { EditorState, Plugin } from "prosemirror-state"
import { selectedTableCell } from "./helper"
import { selectionCell } from "prosemirror-tables"

export const createTableHeigthlightPlugin = () => {
    return new Plugin({
        props: {
            decorations: (state: EditorState) => {
                const cell = selectedTableCell(state)
                if (!cell) {
                    return null
                }

                const $cell = selectionCell(state)
                if (!$cell) {
                    return null
                }
                const nodeStart: number = $cell.pos
                const nodeEnd: number = nodeStart + cell.nodeSize
                return DecorationSet.create(state.doc, [
                    Decoration.node(nodeStart, nodeEnd, {
                        // class: "selectedCell", // `selectedCell` will make text color lighter, which will reduce user's visual concentration.
                        style: "background: rgba(200, 200, 255, 0.4)",
                    }),
                ])
            },
        },
    })
}
