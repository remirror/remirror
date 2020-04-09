export interface ExtensionSpec {
  module: string;
  export?: string;
  version?: string;
}
export interface CodeOptions {
  extensions: ExtensionSpec[];
}
