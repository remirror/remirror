export interface EntryPoint {
  // This entry is a "main" entry point or a "subpath" entry point.
  isMain: boolean;

  // The absolute path to the entry file. Usually ends with `.ts` or `.tsx`.
  // e.g. /projects/remirror/packages/remirror__extension-foo/src/submodule/index.tsx
  inFile: string;

  // The absolute path to the output file. Usually ends with `.js`.
  // e.g. /projects/remirror/packages/remirror__extension-foo/submodule/dist/remirror-extension-foo.js
  outFile: string;

  // The relative path to the output file.
  // e.g. ".", "./subpath", "./subpath/subpath"
  subpath: string;

  // The format of the input file. Mostly `dual`.
  format: 'cjs' | 'esm' | 'dual';
}
