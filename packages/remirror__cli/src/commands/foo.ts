import { logger } from '../logger';

export function foo(str: string, options: { first: boolean; separator: string }) {
  const limit = options.first ? 1 : undefined;
  logger.log(str.split(options.separator, limit));
}
