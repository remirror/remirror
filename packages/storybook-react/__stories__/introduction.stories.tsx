import React from 'react';

const devInfo = [
  // These environment variable will be available in GitHub Action workflows.
  process.env.STORYBOOK_BUILD_TIME ?? 'unknown',
  process.env.STORYBOOK_GIT_REF ?? 'unknown',
  (process.env.STORYBOOK_GIT_SHA ?? 'unknown').slice(0, 7),
].join(' · ');

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
      <h1>Welcome to remirror storybook.</h1>
      <div style={{ height: '64px' }} />
      <p>
        <div style={{ color: 'gray' }}>{devInfo}</div>
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
