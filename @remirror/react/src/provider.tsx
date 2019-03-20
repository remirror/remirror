import React, { ComponentType, createContext, FC, FunctionComponent } from 'react';

import { Cast, isEmptyObject, Omit } from '@remirror/core';
import hoistNonReactStatics from 'hoist-non-react-statics';
import { Remirror } from './remirror';
import { InjectedRemirrorProps, RemirrorProps } from './types';

export const RemirrorContext = createContext<InjectedRemirrorProps>(Cast<InjectedRemirrorProps>({}));

export const RemirrorProvider: FC<RemirrorProps> = ({ children, ...props }) => {
  return (
    <Remirror {...props}>
      {value => <RemirrorContext.Provider value={value}>{children}</RemirrorContext.Provider>}
    </Remirror>
  );
};

const checkValidRenderPropParams = (params: InjectedRemirrorProps) => {
  if (isEmptyObject(params)) {
    throw new Error('No props received for the Text Editor Params');
  }
  return true;
};

export const withRemirror = <GProps extends InjectedRemirrorProps>(Wrapped: ComponentType<GProps>) => {
  type EnhancedComponentProps = Omit<GProps, keyof InjectedRemirrorProps>;
  const EnhancedComponent: FunctionComponent<EnhancedComponentProps> = props => {
    return (
      <RemirrorContext.Consumer>
        {params => {
          checkValidRenderPropParams(params);
          return <Wrapped {...Cast<GProps>({ ...props, ...params })} />;
        }}
      </RemirrorContext.Consumer>
    );
  };

  return hoistNonReactStatics(EnhancedComponent, Wrapped);
};
