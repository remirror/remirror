import React, { ComponentType, createContext, FC, FunctionComponent } from 'react';

import { Cast, isEmptyObject, MakeOptional, Omit } from '@remirror/core';
import hoistNonReactStatics from 'hoist-non-react-statics';
import { defaultProps } from './helpers';
import { Remirror } from './remirror';
import { GetPositionerReturn, InjectedRemirrorProps, RemirrorProps, UsePositionerParams } from './types';

/**
 * Creates a ReactContext for the Remirror component
 */
export const RemirrorContext = createContext<InjectedRemirrorProps>(Cast<InjectedRemirrorProps>({}));

export type RemirrorProviderProps = MakeOptional<Omit<RemirrorProps, 'children'>, keyof typeof defaultProps>;

/**
 * The RemirrorProvider which injects context into any of it child components.
 *
 * These can either be consumed using React Hooks
 * - `useRemirrorContext`
 * - `usePositioner`
 *
 * Or the higher order component
 * - `withRemirror`
 * - `withPositioner`
 */
export const RemirrorProvider: FC<RemirrorProviderProps> = ({ children, ...props }) => {
  return (
    <Remirror {...props}>
      {value => <RemirrorContext.Provider value={value}>{children}</RemirrorContext.Provider>}
    </Remirror>
  );
};

const checkValidRenderPropParams = (params: InjectedRemirrorProps) => {
  if (isEmptyObject(params)) {
    throw new Error('No props received for the RemirrorProvider component');
  }
  return true;
};

/**
 * A higher order component which passes the RemirrorContext to the component it wraps.
 *
 * @param WrappedComponent
 */
export const withRemirror = <GProps extends InjectedRemirrorProps>(
  WrappedComponent: ComponentType<GProps>,
) => {
  type EnhancedComponentProps = Omit<GProps, keyof InjectedRemirrorProps>;
  const EnhancedComponent: FunctionComponent<EnhancedComponentProps> = props => {
    return (
      <RemirrorContext.Consumer>
        {params => {
          checkValidRenderPropParams(params);
          return <WrappedComponent {...Cast<GProps>({ ...props, ...params })} />;
        }}
      </RemirrorContext.Consumer>
    );
  };

  return hoistNonReactStatics(EnhancedComponent, WrappedComponent);
};

/**
 * A higher order component which passes the positioner props to the component it wraps.
 * This is useful for creating menus which need access to position information
 *
 * @param params
 */
export const withPositioner = <GRefKey extends string = 'ref'>({
  positioner,
  ...rest
}: UsePositionerParams<GRefKey>) => <GProps extends GetPositionerReturn<GRefKey>>(
  WrappedComponent: ComponentType<GProps>,
) => {
  type EnhancedComponentProps = Omit<GProps, keyof GetPositionerReturn<GRefKey>>;
  const EnhancedComponent: FunctionComponent<EnhancedComponentProps> = props => {
    return (
      <RemirrorContext.Consumer>
        {({ getPositionerProps }) => {
          console.log(getPositionerProps({ ...positioner, ...rest }));
          return (
            <WrappedComponent
              {...Cast<GProps>({ ...props, ...getPositionerProps<GRefKey>({ ...positioner, ...rest }) })}
            />
          );
        }}
      </RemirrorContext.Consumer>
    );
  };

  return hoistNonReactStatics(EnhancedComponent, WrappedComponent);
};
