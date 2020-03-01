/** @jsx jsx */

import { Interpolation, jsx } from '@emotion/core';
import { omit, pick } from '@remirror/core-helpers';
import { KeyOfThemeVariant } from '@remirror/core-types';
import { useRemirrorTheme } from '@remirror/ui';
import {
  ColorProperty,
  FontFamilyProperty,
  FontSizeProperty,
  FontWeightProperty,
  LetterSpacingProperty,
  TextAlignProperty,
} from 'csstype';
import mergeProps from 'merge-props';
import { FC, ReactElement, ReactNode, forwardRef } from 'react';

type MergeProp = typeof mergeProps;

interface InjectedTextProps {
  className?: string;
  children: ReactNode;
  css: Interpolation;
}

interface RenderPropsParams {
  props: InjectedTextProps;
  mergeProps: MergeProp;
}

export interface BaseTextProps {
  render: (params: RenderPropsParams) => ReactElement;
  children?: ReactNode;
  variant?: KeyOfThemeVariant<'remirror:text'>;
  className?: string;
  color?: ColorProperty;
  textAlign?: TextAlignProperty;
  letterSpacing?: LetterSpacingProperty<number | string>;
  fontWeight?: FontWeightProperty;
  fontFamily?: FontFamilyProperty;
  fontSize?: FontSizeProperty<string | number>;
}

const keys = ['textAlign', 'letterSpacing', 'fontWeight', 'fontFamily', 'fontSize', 'children'] as const;
const pickTextProps = <GProps extends TextProps>(props: GProps) => pick(props, keys as any);
const omitTextProps = <GProps extends TextProps>(props: GProps) => omit(props, keys as any);

export const BaseText: FC<BaseTextProps> = ({
  children,
  render,
  variant = 'p',
  className,
  color,
  textAlign,
  letterSpacing,
  fontFamily,
  fontWeight,
  fontSize,
}) => {
  const { sxx } = useRemirrorTheme();
  const css = sxx(
    { variant: `remirror:text.${variant}` },
    { color, textAlign, letterSpacing, fontFamily, fontWeight, fontSize },
  );

  return render({ props: { children, css, className }, mergeProps });
};

export interface TextProps extends Omit<BaseTextProps, 'render' | 'variant'> {}

export const H1 = forwardRef<HTMLHeadingElement, TextProps & JSX.IntrinsicElements['h1']>((props, ref) => {
  return (
    <BaseText
      variant='h1'
      {...pickTextProps(props)}
      render={params => <h1 {...params.mergeProps(params.props, omitTextProps(props))} ref={ref} />}
    />
  );
});
H1.displayName = 'H1';

export const H2 = forwardRef<HTMLHeadingElement, TextProps & JSX.IntrinsicElements['h2']>((props, ref) => {
  return (
    <BaseText
      variant='h2'
      {...pickTextProps(props)}
      render={params => <h2 {...params.mergeProps(params.props, omitTextProps(props))} ref={ref} />}
    />
  );
});
H2.displayName = 'H2';

export const H3 = forwardRef<HTMLHeadingElement, TextProps & JSX.IntrinsicElements['h3']>((props, ref) => {
  return (
    <BaseText
      variant='h3'
      {...pickTextProps(props)}
      render={params => <h3 {...params.mergeProps(params.props, omitTextProps(props))} ref={ref} />}
    />
  );
});
H3.displayName = 'H3';

export const H4 = forwardRef<HTMLHeadingElement, TextProps & JSX.IntrinsicElements['h4']>((props, ref) => {
  return (
    <BaseText
      variant='h4'
      {...pickTextProps(props)}
      render={params => <h4 {...params.mergeProps(params.props, omitTextProps(props))} ref={ref} />}
    />
  );
});
H4.displayName = 'H4';

export const H5 = forwardRef<HTMLHeadingElement, TextProps & JSX.IntrinsicElements['h5']>((props, ref) => {
  return (
    <BaseText
      variant='h5'
      {...pickTextProps(props)}
      render={params => <h5 {...params.mergeProps(params.props, omitTextProps(props))} ref={ref} />}
    />
  );
});
H5.displayName = 'H5';

export const H6 = forwardRef<HTMLHeadingElement, TextProps & JSX.IntrinsicElements['h6']>((props, ref) => {
  return (
    <BaseText
      variant='h6'
      {...pickTextProps(props)}
      render={params => <h6 {...params.mergeProps(params.props, omitTextProps(props))} ref={ref} />}
    />
  );
});
H6.displayName = 'H6';

export const Text = forwardRef<HTMLParagraphElement, TextProps & JSX.IntrinsicElements['p']>((props, ref) => {
  return (
    <BaseText
      variant='body'
      {...pickTextProps(props)}
      render={params => <p {...params.mergeProps(params.props, omitTextProps(props))} ref={ref} />}
    />
  );
});
Text.displayName = 'Text';

export const Label = forwardRef<HTMLLabelElement, TextProps & JSX.IntrinsicElements['label']>(
  (props, ref) => {
    return (
      <BaseText
        variant='label'
        {...pickTextProps(props)}
        render={params => <label {...params.mergeProps(params.props, omitTextProps(props))} ref={ref} />}
      />
    );
  },
);
Label.displayName = 'Label';

export const Caption = forwardRef<HTMLSpanElement, TextProps & JSX.IntrinsicElements['span']>(
  (props, ref) => {
    return (
      <BaseText
        variant='caption'
        {...pickTextProps(props)}
        render={params => <span {...params.mergeProps(params.props, omitTextProps(props))} ref={ref} />}
      />
    );
  },
);
Caption.displayName = 'Caption';
