import React from 'react';
import { Button, Checkbox } from 'reakit';

import { useExample } from './example-provider';

export const ToggleLanguage = () => {
  const { language, setLanguage } = useExample();
  const toggle = () => setLanguage(language === 'js' ? 'ts' : 'js');
  const checked = language === 'ts';

  return (
    <Checkbox as={Button} checked={checked} onChange={toggle}>
      {checked ? 'JavaScript' : 'TypeScript'}
    </Checkbox>
  );
};
