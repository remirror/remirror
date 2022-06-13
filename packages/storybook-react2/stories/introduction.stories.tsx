import React from 'react';

export const Introduction: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        fontFamily: 'sans-serif',
        padding: '16px',
      }}
    >
      <h1>Welcome to remirror storybook</h1>
      <div style={{ height: '64px' }} />
      <p>
        {/* These environment variable will be available in GitHub Action workflows. */}
        <span style={{ color: '#da649a' }}>{process.env.STORYBOOK_GIT_REF ?? 'unknown'}</span>
        <span style={{ color: '#6d6d6d' }}> · </span>
        <span style={{ color: '#bd60c3' }}>
          {(process.env.STORYBOOK_GIT_SHA ?? 'unknown').slice(0, 9)}
        </span>
        <span style={{ color: '#6d6d6d' }}> · </span>
        <span style={{ color: '#87c4d8' }}>{process.env.STORYBOOK_BUILD_TIME ?? 'unknown'}</span>
      </p>
    </div>
  );
};

export default {
  component: Introduction,
  title: 'Introduction',
  parameters: {
    layout: 'centered',
  },
};
