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
  | { loading: false; exports: string[] };

export interface RemirrorModules {
  [moduleName: string]: RemirrorModuleStatus;
}
