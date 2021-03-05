import { FC } from 'react';
import { Literal } from '@remirror/core';

export const createLinkHandler = (overwriteProps?: Record<string, Literal>) => {
  const linkHandler: FC<{
    href: string;
    target?: string | null;
    children: React.ReactElement<HTMLElement>;
  }> = ({ href, target, children }) => {
    const normalizedAttrs = {
      href,
      target: target ?? undefined,
      ...overwriteProps,
    };
    return <a {...normalizedAttrs}>{children}</a>;
  };
  return linkHandler;
};
