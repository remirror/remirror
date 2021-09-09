import React from 'react';

interface ExampleProps {
  story: React.ComponentType;
  source: React.ComponentType;
}

export const Example: React.FC<ExampleProps> = ({ url, story, source }) => {
  return (
    <div>
      <div> Story: </div>
      {story}
      <div> source: </div>
      {source}
    </div>
  );
};
