export function repeat<T extends any>(val: T, times: number): T[] {
  const result: T[] = [];

  for (let i = 0; i < times; i++) {
    result.push(val);
  }

  return result;
}
