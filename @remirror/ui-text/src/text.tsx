import { Interpolation } from '@emotion/core';
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
import React, { FC, forwardRef, ReactNode } from 'react';

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
  renderProp: (params: RenderPropsParams) => JSX.Element;
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
  renderProp,
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

  return renderProp({ props: { children, css, className }, mergeProps });
};

export interface TextProps extends Omit<BaseTextProps, 'renderProp' | 'variant'> {}

export const H1 = forwardRef<HTMLHeadingElement, TextProps & JSX.IntrinsicElements['h1']>((props, ref) => {
  return (
    <BaseText
      variant='h1'
      {...pickTextProps(props)}
      renderProp={params => <h1 {...params.mergeProps(params.props, omitTextProps(props))} ref={ref} />}
    />
  );
});

export const H2 = forwardRef<HTMLHeadingElement, TextProps & JSX.IntrinsicElements['h2']>((props, ref) => {
  return (
    <BaseText
      variant='h2'
      {...pickTextProps(props)}
      renderProp={params => <h2 {...params.mergeProps(params.props, omitTextProps(props))} ref={ref} />}
    />
  );
});

export const H3 = forwardRef<HTMLHeadingElement, TextProps & JSX.IntrinsicElements['h3']>((props, ref) => {
  return (
    <BaseText
      variant='h3'
      {...pickTextProps(props)}
      renderProp={params => <h3 {...params.mergeProps(params.props, omitTextProps(props))} ref={ref} />}
    />
  );
});

export const H4 = forwardRef<HTMLHeadingElement, TextProps & JSX.IntrinsicElements['h4']>((props, ref) => {
  return (
    <BaseText
      variant='h4'
      {...pickTextProps(props)}
      renderProp={params => <h4 {...params.mergeProps(params.props, omitTextProps(props))} ref={ref} />}
    />
  );
});

export const H5 = forwardRef<HTMLHeadingElement, TextProps & JSX.IntrinsicElements['h5']>((props, ref) => {
  return (
    <BaseText
      variant='h5'
      {...pickTextProps(props)}
      renderProp={params => <h5 {...params.mergeProps(params.props, omitTextProps(props))} ref={ref} />}
    />
  );
});

export const H6 = forwardRef<HTMLHeadingElement, TextProps & JSX.IntrinsicElements['h6']>((props, ref) => {
  return (
    <BaseText
      variant='h6'
      {...pickTextProps(props)}
      renderProp={params => <h6 {...params.mergeProps(params.props, omitTextProps(props))} ref={ref} />}
    />
  );
});

export const Text = forwardRef<HTMLParagraphElement, TextProps & JSX.IntrinsicElements['p']>((props, ref) => {
  return (
    <BaseText
      variant='body'
      {...pickTextProps(props)}
      renderProp={params => <p {...params.mergeProps(params.props, omitTextProps(props))} ref={ref} />}
    />
  );
});

export const Label = forwardRef<HTMLLabelElement, TextProps & JSX.IntrinsicElements['label']>(
  (props, ref) => {
    return (
      <BaseText
        variant='label'
        {...pickTextProps(props)}
        renderProp={params => <label {...params.mergeProps(params.props, omitTextProps(props))} ref={ref} />}
      />
    );
  },
);

export const Caption = forwardRef<HTMLSpanElement, TextProps & JSX.IntrinsicElements['span']>(
  (props, ref) => {
    return (
      <BaseText
        variant='caption'
        {...pickTextProps(props)}
        renderProp={params => <span {...params.mergeProps(params.props, omitTextProps(props))} ref={ref} />}
      />
    );
  },
);
