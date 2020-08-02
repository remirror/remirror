import React, { FunctionComponent } from 'react';

import type { User } from '../interfaces';

interface ListDetailProps {
  item: User;
}

const ListDetail: FunctionComponent<ListDetailProps> = ({ item: user }) => (
  <div>
    <h1>Detail for {user.name}</h1>
    <p>ID: {user.id}</p>
  </div>
);

export default ListDetail;
