/**
 * @module
 *
 * Taken from
 * https://github.com/react-icons/react-icons/blob/10199cca7abeb3efbc647090714daa279da45779/packages/react-icons/src/iconBase.tsx#L1-L62
 */

import { createElement, ReactElement, ReactNode, SVGAttributes } from 'react';
import { IconTree } from '@remirror/icons';
import * as Icons from '@remirror/icons';

import { IconContext } from './icons-context';

/**
 * Convert the provided icon tree to a react element.
 */
function Tree2Element(tree: IconTree[]): Array<ReactElement<object>> {
  return tree.map((node, index) =>
    createElement(node.tag, { key: index, ...node.attr }, Tree2Element(node.child ?? [])),
  );
}

/**
 * A higher order component which creates the Icon component.
 */
export function GenIcon(tree: IconTree[], viewBox = '0 0 24 24'): IconType {
  // eslint-disable-next-line react/display-name
  return (props: IconBaseProps) => (
    <IconBase viewBox={viewBox} {...props}>
      {Tree2Element(tree ?? [])}
    </IconBase>
  );
}

export interface IconProps extends IconBaseProps {
  /**
   * The name of the core icon to use.
   */
  name: Icons.CoreIcon;
}

/**
 * Dynamic icons for the remirror codebase..
 */
export const Icon = (props: IconProps): JSX.Element => {
  const { name } = props;
  return <IconBase {...props}>{Tree2Element(Icons[name])}</IconBase>;
};

export interface IconBaseProps extends SVGAttributes<SVGElement> {
  children?: ReactNode;
  size?: string | number;
  color?: string;
  title?: string;
}

export type IconType = (props: IconBaseProps) => JSX.Element;

/**
 * The base icon as an svg with the icon context available
 */
export const IconBase = (props: IconBaseProps): JSX.Element => {
  const renderSvg = (context: IconContext) => {
    const computedSize = props.size ?? context.size ?? '1em';
    let className;

    if (context.className) {
      className = context.className;
    }

    if (props.className) {
      className = (className ? `${className} ` : '') + props.className;
    }

    const { title, ...svgProps } = props;

    return (
      <svg
        stroke='currentColor'
        fill='currentColor'
        strokeWidth='0'
        {...context.attr}
        {...svgProps}
        className={className}
        style={{ color: props.color ?? context.color, ...context.style, ...props.style }}
        height={computedSize}
        width={computedSize}
        xmlns='http://www.w3.org/2000/svg'
        viewBox='0 0 24 24'
      >
        {title && <title>{title}</title>}
        {props.children}
      </svg>
    );
  };

  return <IconContext.Consumer>{renderSvg}</IconContext.Consumer>;
};
