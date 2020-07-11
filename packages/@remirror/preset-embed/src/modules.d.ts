declare module 'tiny-querystring' {
  export function parse(queryString: string): Record<string, unknown>;
  export function stringify(object: Record<string, unknown>): string;
}
