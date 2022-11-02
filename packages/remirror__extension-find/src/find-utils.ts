/**
 * Returns a number between 0 and length-1 (inclusive)
 *
 * @internal
 */
export function rotateIndex(index: number, length: number): number {
  if (length <= 0) {
    return 0;
  }

  return ((index % length) + length) % length;
}
