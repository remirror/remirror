import React, { FunctionComponent } from 'react';
import { TwitterAtSuggestionsProp, TwitterUserData } from './types';

export const AtSuggestions: FunctionComponent<TwitterAtSuggestionsProp> = ({ submit, data }) => {
  const onSubmit = (user: TwitterUserData) => () => {
    submit({
      id: user.username,
      label: `@${user.username}`,
      role: 'presentation',
      href: `/${user.username}`,
    });
  };

  return (
    <a className='suggestions-dropdown' role='presentation'>
      {data.map(user => (
        <div
          className={`suggestions-item${user.active ? ' active' : ''}`}
          key={user.username}
          aria-selected={user.active ? 'true' : 'false'}
          aria-haspopup='false'
          role='option'
          onClick={onSubmit(user)}
        >
          <img src={user.avatarUrl} />
          <span className='display-name'>{user.displayName}</span>
          <span className='username'>{user.username}</span>
        </div>
      ))}
    </a>
  );
};
