/// <reference types="@docusaurus/module-type-aliases" />

declare module '@docusaurus/Link' {
  import { ComponentType, AllHTMLAttributes } from 'react';

  export interface LinkProps extends AllHTMLAttributes<HTMLElement> {
    readonly isNavLink?: boolean;
    readonly to?: string;
    readonly href?: string;
  }

  const Link: ComponentType<LinkProps>;

  export default Link;
}

declare module '@docusaurus/useBaseUrl' {
  export interface BaseUrlOptions {
    forcePrependBaseUrl: boolean;
    absolute: boolean;
  }

  export default function useBaseUrl(url: string, options?: Partial<BaseUrlOptions>): string;
}

declare module '@docusaurus/useDocusaurusContext' {
  import { DocusaurusContext } from '@docusaurus/types';

  export default function useDocusaurusContext(): DocusaurusContext;
}
