/**
 * Remove the extension from a file name or a file path.
 */
export function removeFileExt(file: string): string {
  return (/^(.*)\.\w+$/.exec(file) ?? [])[1];
}
