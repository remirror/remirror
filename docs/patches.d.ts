declare module '*.gql' {
  import { DocumentNode } from 'graphql';

  const value: DocumentNode;
  export = value;
}

declare module '@theme-ui/sidenav' {
  import { MDXProviderComponentsProp } from '@mdx-js/react';
  import { FC, ReactNode, RefForwardingComponent, MouseEventHandler } from 'react';

  type DivProps = JSX.IntrinsicElements['div'];

  export interface SidnavProps extends DivProps {
    /**
     * Whether the side nav is open or closed.
     */
    open?: boolean;
    /**
     * The component map to be passed into the MDXProvider
     */
    components?: Partial<MDXProviderComponentsProp>;
    children?: ReactNode;
  }

  export const Sidenav: RefForwardingComponent<HTMLDivElement, SidnavProps>;

  export interface PaginationProps extends DivProps {
    /**
     * The current pathname
     *
     * @defaultValue ''
     */
    pathname?: string;
    children?: ReactNode;
  }

  export const Pagination: FC<PaginationProps>;

  export const AccordionNav: RefForwardingComponent<HTMLDivElement, SidnavProps>;

  export interface AccordionButtonProps {
    /** True when the side nav is open */
    open: boolean;

    /** The current pathname */
    pathname?: string;
    href?: string;
    onClick: MouseEventHandler<HTMLButtonElement>;
  }
  export const AccordionButton: FC<AccordionButtonProps>;
}

declare module '@theme-ui/prism' {
  import Prism from 'prismjs';
  import { FC } from 'react';

  export interface CodeBlockProps {
    /**
     * The class name which is used to automatically infer the language.
     */
    className?: string;

    /**
     * A custom instance of prism to use instead of the default one.
     */
    prism?: typeof Prism;
  }

  /**
   * A syntax highlighting component based on
   * [prism-react-renderer](https://github.com/FormidableLabs/prism-react-renderer)
   * that works seamlessly with Theme UI.
   */
  const CodeBlock: FC<CodeBlockProps>;

  export default CodeBlock;
}

declare module '@theme-ui/typography' {
  import { RhythmStyleObject } from 'compass-vertical-rhythm';
  import { TypographyOptions } from 'typography';

  export const style: Record<string, any>;

  export interface TypographyThemeUI {
    typography: RhythmStyleObject;
    styles: Record<string, any>;
    space: Record<string, any>;
    fonts: Record<string, any>;
    fontSizes: Record<string, any>;
    fontWeights: Record<string, any>;
    lineHeights: Record<string, any>;
  }

  export function toTheme(options: Partial<TypographyOptions>): TypographyThemeUI;
}

declare module '*.mdx' {
  const MDXComponent: (props: any) => JSX.Element;
  export default MDXComponent;
}

declare module '*.md' {
  const MDXComponent: (props: any) => JSX.Element;
  export default MDXComponent;
}

declare module 'compass-vertical-rhythm' {
  import * as CSS from 'csstype';
  import { ReactNode } from 'react';

  function VerticalRhythm(options: VerticalRhythm.RhythmOptions): VerticalRhythm.RhythmType;

  namespace VerticalRhythm {
    interface RhythmOptions {
      /**
       * @defaultValue '16px'
       */
      baseFontSize?: CSS.FontSizeProperty<number | string>;

      /**
       * @defaultValue 1.5
       */
      baseLineHeight?: number;

      /**
       * @defaultValue 'rem'
       */
      rhythmUnit?: string;

      /**
       * @defaultValue '1px'
       */
      defaultRhythmBorderWidth?: CSS.BorderWidthProperty<number | string>;

      /**
       * @defaultValue 'solid'
       */
      defaultRhythmBorderStyle?: string;

      /**
       * @defaultValue `true`
       */
      roundToNearestHalfLine?: boolean;

      /**
       * @default '2px'
       */
      minLinePadding?: string;
    }

    interface RhythmType {
      rhythm: (lines?: number, fontSize?: number, offset?: number) => string;
      /**
       * Set these values on the html tag in your css.
       */
      establishBaseline: RhythmStyleObject;
      linesForFontSize: (fontSize: CSS.FontSizeProperty<number | string>) => number;
      adjustFontSizeTo: (
        toSize: CSS.FontSizeProperty<number | string>,
        lines?: number | 'auto',
        fromSize?: CSS.FontSizeProperty<number | string>,
      ) => RhythmStyleObject;
    }

    interface RhythmStyleObject {
      fontSize: string;
      lineHeight: string;
    }
  }

  export = VerticalRhythm;
}

declare module 'typography' {
  import { RhythmStyleObject, RhythmType } from 'compass-vertical-rhythm';

  export interface GoogleFontsType {
    name: string;
    styles: string[];
  }

  interface VerticalRhythmType extends RhythmType {
    scale: (value: number) => RhythmStyleObject;
  }

  export interface TypographyOptions {
    title: string;
    baseFontSize?: string;
    baseLineHeight?: number;
    scaleRatio?: number;
    googleFonts?: GoogleFontsType[];
    headerFontFamily?: string[];
    bodyFontFamily?: string[];
    headerColor?: string;
    bodyColor?: string;
    headerWeight?: number | string;
    bodyWeight?: number | string;
    boldWeight?: number | string;
    blockMarginBottom?: number;
    includeNormalize?: boolean;
    overrideStyles?: (
      verticalRhythm: VerticalRhythmType, // TODO Create flow type for compass-vertical-rhythm and import here.
      options: TypographyOptions,
      styles: Record<string, any>,
    ) => Record<string, any>;
    overrideThemeStyles?: (
      verticalRhythm: VerticalRhythmType, // TODO Create flow type for compass-vertical-rhythm and import here.
      options: TypographyOptions,
      styles: Record<string, any>,
    ) => Record<string, any>;
    plugins?: any[];
  }

  export interface TypographyOutput extends VerticalRhythmType {
    options: TypographyOptions;
    createStyles: () => string;
    toJSON: () => Record<string, any>;
    toString: () => string;
    injectStyles: () => void;
  }

  function typography(options: TypographyOptions): TypographyOutput;
  export default typography;
}

declare module 'typography-theme-alton' {
  import { TypographyOptions } from 'typography';

  const theme: TypographyOptions;
  export default theme;
}

declare module 'typography-theme-anonymous' {
  import { TypographyOptions } from 'typography';

  const theme: TypographyOptions;
  export default theme;
}

declare module 'typography-theme-bootstrap' {
  import { TypographyOptions } from 'typography';

  const theme: TypographyOptions;
  export default theme;
}

declare module 'typography-theme-de-young' {
  import { TypographyOptions } from 'typography';

  const theme: TypographyOptions;
  export default theme;
}

declare module 'typography-theme-doelger' {
  import { TypographyOptions } from 'typography';

  const theme: TypographyOptions;
  export default theme;
}

declare module 'typography-theme-elk-glen' {
  import { TypographyOptions } from 'typography';

  const theme: TypographyOptions;
  export default theme;
}

declare module 'typography-theme-fairy-gates' {
  import { TypographyOptions } from 'typography';

  const theme: TypographyOptions;
  export default theme;
}

declare module 'typography-theme-funston' {
  import { TypographyOptions } from 'typography';

  const theme: TypographyOptions;
  export default theme;
}

declare module 'typography-theme-github' {
  import { TypographyOptions } from 'typography';

  const theme: TypographyOptions;
  export default theme;
}

declare module 'typography-theme-grand-view' {
  import { TypographyOptions } from 'typography';

  const theme: TypographyOptions;
  export default theme;
}

declare module 'typography-theme-irving' {
  import { TypographyOptions } from 'typography';

  const theme: TypographyOptions;
  export default theme;
}

declare module 'typography-theme-judah' {
  import { TypographyOptions } from 'typography';

  const theme: TypographyOptions;
  export default theme;
}

declare module 'typography-theme-kirkham' {
  import { TypographyOptions } from 'typography';

  const theme: TypographyOptions;
  export default theme;
}

declare module 'typography-theme-lawton' {
  import { TypographyOptions } from 'typography';

  const theme: TypographyOptions;
  export default theme;
}

declare module 'typography-theme-legible' {
  import { TypographyOptions } from 'typography';

  const theme: TypographyOptions;
  export default theme;
}

declare module 'typography-theme-lincoln' {
  import { TypographyOptions } from 'typography';

  const theme: TypographyOptions;
  export default theme;
}

declare module 'typography-theme-moraga' {
  import { TypographyOptions } from 'typography';

  const theme: TypographyOptions;
  export default theme;
}

declare module 'typography-theme-noriega' {
  import { TypographyOptions } from 'typography';

  const theme: TypographyOptions;
  export default theme;
}

declare module 'typography-theme-ocean-beach' {
  import { TypographyOptions } from 'typography';

  const theme: TypographyOptions;
  export default theme;
}

declare module 'typography-theme-parnassus' {
  import { TypographyOptions } from 'typography';

  const theme: TypographyOptions;
  export default theme;
}

declare module 'typography-theme-st-annes' {
  import { TypographyOptions } from 'typography';

  const theme: TypographyOptions;
  export default theme;
}

declare module 'typography-theme-stardust' {
  import { TypographyOptions } from 'typography';

  const theme: TypographyOptions;
  export default theme;
}

declare module 'typography-theme-stern-grove' {
  import { TypographyOptions } from 'typography';

  const theme: TypographyOptions;
  export default theme;
}

declare module 'typography-theme-stow-lake' {
  import { TypographyOptions } from 'typography';

  const theme: TypographyOptions;
  export default theme;
}

declare module 'typography-theme-sutro' {
  import { TypographyOptions } from 'typography';

  const theme: TypographyOptions;
  export default theme;
}

declare module 'typography-theme-trajan' {
  import { TypographyOptions } from 'typography';

  const theme: TypographyOptions;
  export default theme;
}

declare module 'typography-theme-twin-peaks' {
  import { TypographyOptions } from 'typography';

  const theme: TypographyOptions;
  export default theme;
}

declare module 'typography-theme-us-web-design-standards' {
  import { TypographyOptions } from 'typography';

  const theme: TypographyOptions;
  export default theme;
}

declare module 'typography-theme-wikipedia' {
  import { TypographyOptions } from 'typography';

  const theme: TypographyOptions;
  export default theme;
}

declare module 'typography-theme-wordpress-2010' {
  import { TypographyOptions } from 'typography';

  const theme: TypographyOptions;
  export default theme;
}

declare module 'typography-theme-wordpress-2011' {
  import { TypographyOptions } from 'typography';

  const theme: TypographyOptions;
  export default theme;
}

declare module 'typography-theme-wordpress-2012' {
  import { TypographyOptions } from 'typography';

  const theme: TypographyOptions;
  export default theme;
}

declare module 'typography-theme-wordpress-2013' {
  import { TypographyOptions } from 'typography';

  const theme: TypographyOptions;
  export default theme;
}

declare module 'typography-theme-wordpress-2014' {
  import { TypographyOptions } from 'typography';

  const theme: TypographyOptions;
  export default theme;
}

declare module 'typography-theme-wordpress-2015' {
  import { TypographyOptions } from 'typography';

  const theme: TypographyOptions;
  export default theme;
}

declare module 'typography-theme-wordpress-2016' {
  import { TypographyOptions } from 'typography';

  const theme: TypographyOptions;
  export default theme;
}

declare module 'typography-theme-wordpress-kubrick' {
  import { TypographyOptions } from 'typography';

  const theme: TypographyOptions;
  export default theme;
}

declare module 'typography-theme-zacklive' {
  import { TypographyOptions } from 'typography';

  const theme: TypographyOptions;
  export default theme;
}
