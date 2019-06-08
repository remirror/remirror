import * as React from 'react';
import { User } from '../interfaces';
import ListItem from './list-item';

interface Props {
  items: User[];
}

const List: React.FunctionComponent<Props> = ({ items }) => (
  <ul>
    {items.map(item => (
      <li key={item.id}>
        <ListItem data={item} />
      </li>
    ))}
  </ul>
);

export default List;
