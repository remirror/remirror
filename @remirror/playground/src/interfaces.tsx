export interface ExtensionSpec {
  module: string;
  export?: string;
  version?: string;
}
export interface CodeOptions {
  extensions: ExtensionSpec[];
}

export type RemirrorModuleStatus =
  | {
      loading: true;
    }
  | { loading: false; error: Error }
  | { loading: false; error: null; exports: Exports };

export interface RemirrorModules {
  [moduleName: string]: RemirrorModuleStatus;
}

export interface Exports {
  [exportName: string]: any;
}
