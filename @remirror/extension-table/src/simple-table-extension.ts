import {
    ExtensionManagerNodeTypeParams,
    KeyBindings,
    NodeExtension,
    NodeExtensionSpec,
} from "@remirror/core"
import {   buildBlockEnterKeymapBindings , selectedTableCell } from "./helper"
import { Node as ProsemirroNode } from "prosemirror-model"
import { Transaction } from "prosemirror-state"
import {
    addColumnAfter,
    addColumnBefore,
    addRowAfter,
    addRowBefore,
    deleteColumn,
    deleteRow,
    tableEditing,
} from "prosemirror-tables"
import { createTableHeigthlightPlugin } from "./plugin"


export interface TableSchemaSpec extends NodeExtensionSpec {
    tableRole: "table" | "row" | "cell"
}

export class TableExtension extends NodeExtension   {
    public readonly name = "rinoTable"

    public readonly schema: TableSchemaSpec = {
        content: "rinoTableRow+",
        tableRole: "table",
        isolating: true,
        group: "block",
        parseDOM: [{ tag: "table" }],
        toDOM() {
            return ["table", 0]
        },
    }

    public keys({ type, schema }: ExtensionManagerNodeTypeParams): KeyBindings {
        return buildBlockEnterKeymapBindings(/^\|((?:[^|]+\|){2,})\s*$/, type, {
            transact: (match: string[], tr: Transaction, start: number, end: number) => {
                const texts = match[1]
                    .split("|")
                    .slice(0, -1) // Remove the empty string at the end
                    .map(text => {
                        text = text.trim()
                        if (!text) {text = " "} // Prosemirror text doesn't allow empty text
                        return schema.text(text)
                    })

                const cells = texts.map(text => schema.nodes.rinoTableCell.create(null, text))
                const row = schema.nodes.rinoTableRow.create(null, cells)
                const table = schema.nodes.rinoTable.create(null, row)
                tr = tr.delete(start, end).insert(start, table)
                return tr
            },
        })
    }

    public helpers(params: ExtensionManagerNodeTypeParams) {
        return {
            selectedTableCell: (): ProsemirroNode | null => {
                const state = params.getState()
                return selectedTableCell(state)
            },
        }
    }

    public plugin() {
        return tableEditing()
    }

    public toMarkdown() {}
    public fromMarkdown() {}
}

export class RinoTableRowExtension extends NodeExtension  {
    public readonly name = "rinoTableRow"

    public   readonly schema: TableSchemaSpec = {
        content: "rinoTableCell+",
        tableRole: "row",
        parseDOM: [{ tag: "tr" }],
        toDOM() {
            return ["tr", 0]
        },
    }

   public  toMarkdown() {}
   public  fromMarkdown() {}
}

export class RinoTableCellExtension extends NodeExtension  {
    public readonly name = "rinoTableCell"

    public readonly schema: TableSchemaSpec = {
        content: "inline*",
        attrs: {
            colspan: {
                default: 1,
            },
            rowspan: {
                default: 1,
            },
            colwidth: {
                default: null,
            },
        },
        tableRole: "cell",
        isolating: true,
        parseDOM: [{ tag: "td" }, { tag: "th" }],
        toDOM() {
            return ["td", 0]
        },
    }

    public commands() {
        return {
            tableAddColumnAfter: () => addColumnAfter,
            tableAddColumnBefore: () => addColumnBefore,
            tableAddRowAfter: () => addRowAfter,
            tableAddRowBefore: () => addRowBefore,
            tableDeleteColumn: () => deleteColumn,
            tableDeleteRow: () => deleteRow,
            tableDeleteTable: () => deleteRow,
        }
    }

    public plugin() {
        return createTableHeigthlightPlugin()
    }

    public toMarkdown() {}
    public fromMarkdown() {}
}
