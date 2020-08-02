import React, { FunctionComponent } from 'react';

import type { User } from '../interfaces';
import ListItem from './list-item';

interface Props {
  items: User[];
}

const List: FunctionComponent<Props> = ({ items }) => (
  <ul>
    {items.map((item) => (
      <li key={item.id}>
        <ListItem data={item} />
      </li>
    ))}
  </ul>
);

export default List;
