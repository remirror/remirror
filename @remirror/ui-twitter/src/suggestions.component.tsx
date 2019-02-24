import React, { FunctionComponent } from 'react';
import { TwitterAtSuggestionsProp, TwitterHashSuggestionsProp } from './types';

export const AtSuggestions: FunctionComponent<TwitterAtSuggestionsProp> = ({ submitFactory, data }) => {
  return (
    <a
      className='suggestions-dropdown'
      role='presentation'
      style={{
        alignItems: 'stretch',
        display: 'flex',
        flexDirection: 'column',
        flexBasis: 'auto',
        flexShrink: 0,
        margin: 0,
        overflow: 'hidden',
        listStyle: 'none',
        padding: 0,
      }}
    >
      {data.map(user => (
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            borderBottom: '1px solid rgb(230, 236, 240)',
            ...(user.active ? { backgroundColor: 'rgb(245, 248, 250)' } : {}),
          }}
          className={`suggestions-item${user.active ? ' active' : ''}`}
          key={user.username}
          aria-selected={user.active ? 'true' : 'false'}
          aria-haspopup='false'
          role='option'
          onClick={submitFactory(user)}
        >
          <img src={user.avatarUrl} />
          <span className='display-name'>{user.displayName}</span>
          <span className='username'>{user.username}</span>
        </div>
      ))}
    </a>
  );
};

export const HashSuggestions: FunctionComponent<TwitterHashSuggestionsProp> = ({ submitFactory, data }) => {
  return (
    <a
      className='suggestions-dropdown'
      role='presentation'
      style={{
        alignItems: 'stretch',
        display: 'flex',
        flexDirection: 'column',
        flexBasis: 'auto',
        flexShrink: 0,
        margin: 0,
        overflow: 'hidden',
        listStyle: 'none',
        padding: 0,
      }}
    >
      {data.map(({ tag, active }) => (
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            borderBottom: '1px solid rgb(230, 236, 240)',
            ...(active ? { backgroundColor: 'rgb(245, 248, 250)' } : {}),
          }}
          className={`suggestions-item${active ? ' active' : ''}`}
          key={tag}
          aria-selected={active ? 'true' : 'false'}
          aria-haspopup='false'
          role='option'
          onClick={submitFactory({ tag })}
        >
          <span className='display-name'>#{tag}</span>
        </div>
      ))}
    </a>
  );
};
