import React from 'react';

interface StoryExampleProps {
  story: React.ReactNode;
  source: React.ReactNode;
}

export const StoryExample: React.FC<StoryExampleProps> = ({ story, source }) => {
  return (
    <div>
      {story}
      <details>
        <summary>Source code</summary>
        <div>{source}</div>
      </details>
    </div>
  );
};
