import React from 'react';

interface ExampleProps {
  story: React.ComponentType;
  source: React.ComponentType;
}

export const ExampleRoot: React.FC<ExampleProps> = ({ story, source }) => {
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
