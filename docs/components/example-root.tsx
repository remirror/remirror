import React from 'react';

interface ExampleProps {
  story: React.ComponentType;
  source: React.ComponentType;
}

export const ExampleRoot: React.FC<ExampleProps> = ({ story, source }) => {
  return (
    <div>
      {story}
      <strong>Source code:</strong>
      {source}
    </div>
  );
};
