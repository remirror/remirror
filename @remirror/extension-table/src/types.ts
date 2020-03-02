import { NodeExtensionSpec } from "@remirror/core"

export interface TableSchemaSpec extends NodeExtensionSpec {
  tableRole: "table" | "row" | "cell"
}
