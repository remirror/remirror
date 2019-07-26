declare module 'theme-ui' {
  // TypeScript Version: 3.1
  // Type definitions for theme-ui 0.2
  // Project: https://github.com/system-ui/theme-ui#readme
  // Definitions by: Erik Stockmeier <https://github.com/erikdstock>
  // Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

  import { ThemeContext } from '@emotion/core';
  import { SystemStyleObject } from '@styled-system/css';
  import * as CSS from 'csstype';
  import { ThemeProvider } from 'emotion-theming';
  import * as React from 'react';
  import { lineHeight, Theme as StyledSystemTheme } from 'styled-system';

  type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;
  type ObjectOrArray<T> = T[] | { [K: string]: T | ObjectOrArray<T> };

  interface Object<T> {
    [k: string]: T | Object<T>;
  }

  export const ThemeProvider: typeof ThemeProvider;

  type SSColors = StyledSystemTheme['colors'];
  interface ColorModes {
    [k: string]: Partial<Omit<Theme['colors'], 'modes'>>;
  }

  export const Context: React.Context;

  // TODO: Are Theme.colors.background, text, etc really required?
  export interface Theme extends StyledSystemTheme {
    /**
     * Provide a value here to enable color modes
     */
    initialColorMode?: string;

    /**
     * Define the colors that are available through this theme
     */
    colors?: { [k: string]: CSS.ColorProperty | ObjectOrArray<CSS.ColorProperty> } & {
      /**
       * Body background color
       */
      background?: CSS.ColorProperty;

      /**
       * Body foreground color
       */
      text?: CSS.ColorProperty;

      /**
       * Primary brand color for links, buttons, etc.
       */
      primary?: CSS.ColorProperty;

      /**
       * A secondary brand color for alternative styling
       */
      secondary?: CSS.ColorProperty;

      /**
       * A faint color for backgrounds, borders, and accents that do not require high contrast with the background color
       */
      muted?: CSS.ColorProperty;

      /**
       * A contrast color for emphasizing UI
       */
      accent?: CSS.ColorProperty;

      /**
       * Nested color modes can provide overrides when used in conjunction with `Theme.initialColorMode and `useColorMode()`
       */
      modes?: ColorModes;
    };

    /**
     * Styles for elements rendered in MDX can be added to the theme.styles object.
     * This is the primary, low-level way to control typographic and other styles in markdown content.
     * Styles within this object are processed with @styled-system/css
     * and have access to base theme values like colors, fonts, etc.
     */
    styles?: {
      [k: string]: SystemStyleObject;
    };
  }

  /**
   * A React renderer with awareness of the `sx` prop.
   * Requires the [custom @jsx jsx pragma](https://theme-ui.com/sx-prop) declaration
   * at the top of your file for use.
   */
  export const jsx: typeof React.createElement;

  interface SxProps {
    sx?: SystemStyleObject;
  }

  type SxComponent = React.ComponentClass<SxProps>;
  export const Box: SxComponent;
  export const Container: SxComponent;
  export const Flex: SxComponent;
  export const Header: SxComponent;
  export const Footer: SxComponent;
  export const Layout: SxComponent;
  export const Main: SxComponent;
  type StyledTags =
    | 'p'
    | 'b'
    | 'i'
    | 'a'
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'h5'
    | 'h6'
    | 'img'
    | 'pre'
    | 'code'
    | 'ol'
    | 'ul'
    | 'li'
    | 'blockquote'
    | 'hr'
    | 'em'
    | 'table'
    | 'tr'
    | 'th'
    | 'td'
    | 'em'
    | 'strong'
    | 'delete'
    | 'inlineCode'
    | 'thematicBreak'
    | 'div'
    | 'root';
  export const Styled: Record<StyledTags, SxComponent>;

  // TODO: ??? maybe this extra type isn't needed? Maybe SystemStyleObject is enough?
  /** [this doc from styled-system__css]
   * The `SystemStyleObject` extends [style props](https://emotion.sh/docs/object-styles)
   * such that properties that are part of the `Theme` will be transformed to
   * their corresponding values. Other valid CSS properties are also allowed.
   *
   */
  // export interface SxObject extends SystemStyleObject {}

  // // TODO: Verify
  // interface ThemeUIContext {theme: Theme, components: any}

  // // TODO: Verify
  // export const Context: React.Context<ThemeUIContext>

  export const useThemeUI: typeof React.useContext;

  /**
   * A hook retrieving the current color mode and a setter for a new color mode
   * in the theme.
   *
   * @param initialMode - the default color mode to use
   */
  export const useColorMode: <GModes extends string>(
    initialMode?: GModes,
  ) => [GModes, React.Dispatch<React.SetStateAction<GModes>>];

  declare module 'react' {
    interface DOMAttributes<T> {
      sx?: SystemStyleObject & Record<string, SystemStyleObject | unknown> | unknown;
    }
  }

  declare global {
    namespace JSX {
      /**
       * Do we need to modify `LibraryManagedAttributes` too,
       * to make `className` props optional when `css` props is specified?
       */

      interface IntrinsicAttributes {
        sx?: SystemStyleObject & Record<string, SystemStyleObject | unknown> | unknown;
      }
    }
  }
}

declare module '@theme-ui/sidenav' {
  import { MDXProviderComponentsProp } from '@mdx-js/react';
  import { FC, ReactNode, RefForwardingComponent } from 'react';

  type DivProps = JSX.IntrinsicElements['div'];

  export interface SidnavProps extends DivProps {
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
     * @default ''
     */
    pathname?: string;
    children?: ReactNode;
  }

  export const Pagination: FC<PaginationProps>;
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
  const MDXComponent: (props) => JSX.Element;
  export default MDXComponent;
}

declare module '*.md' {
  const MDXComponent: (props) => JSX.Element;
  export default MDXComponent;
}

declare module '@mdx-js/react' {
  import { Component, ComponentType, StyleHTMLAttributes } from 'react';

  export interface MDXProviderComponentsProp {
    /**
     * The wrapper component can be used to set the layout for the MDX document.
     * It’s often used to set container width, borders, background colors, etc.
     * However, it’s also unique because it has access to the children passed to
     * it.
     *
     * This means that you can do powerful things with the MDX document
     * elements.
     */
    wrapper: ComponentType<any>;
    /**
     * Paragraph
     */
    p?: ComponentType<any>;
    /**
     * Heading 1	#
     */
    h1?: ComponentType<any>;
    /**
     * Heading 2	##
     */
    h2?: ComponentType<any>;
    /**
     * Heading 3	###
     */
    h3?: ComponentType<any>;
    /**
     * Heading 4	####
     */
    h4?: ComponentType<any>;
    /**
     * Heading 5	#####
     */
    h5?: ComponentType<any>;
    /**
     * Heading 6	######
     */
    h6?: ComponentType<any>;
    /**
     * Thematic break	***
     */
    thematicBreak?: ComponentType<any>;
    /**
     * Blockquote	>
     */
    blockquote?: ComponentType<any>;
    /**
     * List	-
     */
    ul?: ComponentType<any>;
    /**
     * Ordered list	1.
     */
    ol?: ComponentType<any>;
    /**
     * List item
     */
    li?: ComponentType<any>;
    /**
     * Table
     */
    table?: ComponentType<any>;
    /**
     * Table row
     */
    tr?: ComponentType<any>;
    /**
     * Table Cell
     */
    th?: ComponentType<any>;
    td?: ComponentType<any>;
    /**
     * Pre
     */
    pre?: ComponentType<any>;
    /**
     * Code	`\code```
     */
    code?: ComponentType<any>;
    /**
     * Emphasis	_emphasis_
     */
    em?: ComponentType<any>;
    /**
     * Strong	**strong**
     */
    strong?: ComponentType<any>;
    /**
     * Delete	~~strikethrough~~
     */
    delete?: ComponentType<any>;
    /**
     * InlineCode	`inlineCode`
     */
    inlineCode?: ComponentType<any>;
    /**
     * Break	---
     */
    hr?: ComponentType<any>;
    /**
     * Link	<https://mdxjs.com> or [MDX](https://mdxjs.com)
     */
    a?: ComponentType<any>;
    /**
     * Image	![alt](https://mdx-logo.now.sh)
     */
    img?: ComponentType<any>;

    /**
     * Any other components we wish to define
     */
    [key: string]: ReactNode;
  }
  export interface MDXProps {
    children: React.ReactNode;
    components: MDXProviderComponentsProp;
  }

  export class MDXProvider extends Component<MDXProps> {}
}

declare module 'compass-vertical-rhythm' {
  import * as CSS from 'csstype';

  function VerticalRhythm(options: VerticalRhythm.RhythmOptions): VerticalRhythm.RhythmType;

  namespace VerticalRhythm {
    interface RhythmOptions {
      /**
       * @default '16px'
       */
      baseFontSize?: CSS.FontSizeProperty;

      /**
       * @default 1.5
       */
      baseLineHeight?: number;

      /**
       * @default 'rem'
       */
      rhythmUnit?: string;

      /**
       * @default '1px'
       */
      defaultRhythmBorderWidth?: CSS.BorderWidthProperty;

      /**
       * @default 'solid'
       */
      defaultRhythmBorderStyle?: string;

      /**
       * @default true
       */
      roundToNearestHalfLine?: boolean;

      /**
       * @defualt '2px'
       */
      minLinePadding?: string;
    }

    interface RhythmType {
      rhythm(lines?: number, fontSize?: number, offset?: number): string;
      /**
       * Set these values on the html tag in your css.
       */
      establishBaseline: RhythmStyleObject;
      linesForFontSize(fontSize: CSS.FontSizeProperty): number;
      adjustFontSizeTo(
        toSize: CSS.FontSizeProperty,
        lines?: number | 'auto',
        fromSize?: CSS.FontSizeProperty,
      ): RhythmStyleObject;
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
    createStyles(): string;
    toJSON(): Record<string, any>;
    toString(): string;
    injectStyles(): void;
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
