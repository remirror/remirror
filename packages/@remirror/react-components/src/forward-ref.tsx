/**
 * @module
 *
 * This file provides the types for components which support the `as` prop as
 * well as a forwardRef
 *
 * Full credit to the
 * [`chakra-ui`](https://github.com/chakra-ui/chakra-ui/blob/develop/packages/system/src/forward-ref.tsx#L5-L45)
 * project which I initially considered using as a replacement the `remirror`
 * component library.
 */
import {
  ComponentProps,
  ElementType,
  forwardRef as reactForwardRef,
  PropsWithChildren,
  ReactElement,
  Ref,
  ValidationMap,
  WeakValidationMap,
} from 'react';

/**
 * Alias type for extracting the props of a component.
 */
type PropsOf<Type extends ElementType> = ComponentProps<Type>;

/**
 *
 */
type AddProps<Props> = PropsWithChildren<
  Props extends { transition?: any } ? Omit<Props, 'transition'> : Props
>;

type AddTProps<Type extends ElementType> = PropsOf<Type> extends { color?: any }
  ? Omit<PropsOf<Type>, 'color'>
  : PropsOf<Type>;

/**
 * The props of a component which has the `as` prop so that it can infer the
 * props automatically.
 */
type ComponentWithAsProps<EnhancedType extends ElementType, Type extends ElementType, Props> = {
  as?: EnhancedType;
} & Props &
  Omit<PropsOf<EnhancedType>, keyof PropsOf<Type>> &
  Omit<PropsOf<Type>, keyof Props>;

/**
 * Assign the as prop to a component. Can be used in place of the `FC` import
 * from `react`.
 */
export interface ComponentWithAs<Type extends ElementType, Props> {
  displayName?: string;
  propTypes?: WeakValidationMap<AddProps<Props> & AddTProps<Type>>;
  contextTypes?: ValidationMap<any>;
  defaultProps?: Props & PropsOf<Type> & { as?: ElementType };
  id?: string;
  <EnhancedType extends ElementType>(
    props: ComponentWithAsProps<EnhancedType, Type, Props>,
  ): JSX.Element;
}

/**
 * The prop type for the `forwardRef` function call.
 */
type ForwardRefProps<Props, Type extends ElementType> = PropsWithChildren<Props> &
  Omit<PropsOf<Type>, keyof Props | 'ref'> & { as?: ElementType };

/**
 * A replacement for the `forwardRef` method exported by the `react` module.
 */
export function forwardRef<Props, Type extends ElementType>(
  render: (props: ForwardRefProps<Props, Type>, ref: Ref<any>) => ReactElement | null,
): ComponentWithAs<Type, Props> {
  // Set the component type to unknown so that it can be cast to the correct
  // type on return.
  const component: unknown = reactForwardRef(render);

  return component as ComponentWithAs<Type, Props>;
}
