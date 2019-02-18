/* tslint:disable:no-implicit-dependencies */

import React, { FunctionComponent, MouseEventHandler, useState } from 'react';

import { Remirror, RemirrorEventListener } from '@remirror/react';
import { memoize } from 'lodash';

export const TwitterUI: FunctionComponent = () => {
  return (
    <Remirror onChange={onChange} placeholder='Start typing for magic...' autoFocus={true}>
      {({ getMenuProps, actions }) => {
        return <div />;
      }}
    </Remirror>
  );
};
