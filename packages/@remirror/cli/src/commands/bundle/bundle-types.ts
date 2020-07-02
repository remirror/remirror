export type BundleCommandShape = RemirrorCli.Commands['bundle'];
export type BundleEditorProps = BundleCommandShape & { method: BundleMethod; startTime?: number };
export type BundleMethod = (parameter: BundleCommandShape) => BundleMethodReturn;
export interface BundleMethodReturn {
  bundle: () => Promise<void>;
  write: () => Promise<void>;
  clean: () => Promise<void>;
}
