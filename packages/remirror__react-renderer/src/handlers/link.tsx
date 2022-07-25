import React, { FC } from 'react';
import { Literal } from '@remirror/core';

type LinkHandler = FC<{
  href: string;
  target?: string | null;
  children: React.ReactElement<HTMLElement>;
}>;

export const createLinkHandler = (overwriteAttrs?: Record<string, Literal>): LinkHandler => {
  const linkHandler: LinkHandler = ({ href, target, children }) => {
    const normalizedAttrs = {
      href,
      target: target ?? undefined,
      ...overwriteAttrs,
    };
    return <a {...normalizedAttrs}>{children}</a>;
  };
  return linkHandler;
};
