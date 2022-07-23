/**
 * Slugify a string.
 *
 * Exmaple: "@remirror/extension-file" -> "remirror-extension-file"
 */
export function slugify(str: string) {
  return str
    .replace(/[^\dA-Za-z]+/g, '-')
    .replace(/^-+/g, '')
    .replace(/-+$/g, '')
    .toLocaleLowerCase();
}
