import Link from 'next/link';
import React, { FunctionComponent } from 'react';

import type { User } from '../interfaces';

interface Props {
  data: User;
}

const ListItem: FunctionComponent<Props> = ({ data }) => (
  <Link href={`/detail?id=${data.id}`}>
    <a>
      {data.id}: {data.name}
    </a>
  </Link>
);

export default ListItem;
