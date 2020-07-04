import { render } from '@testing-library/react';
import React from 'react';

import { MentionExtension } from '@remirror/extension-mention';
import { SocialPreset } from '@remirror/preset-social';

import { createSocialManager } from '../../social-utils';
import { useSocialManager } from '../use-social';

describe('useSocialManager', () => {
  it('passes down options', () => {
    expect.assertions(2);
    const Component = () => {
      const manager = useSocialManager([], { social: { appendText: 'custom' } });
      expect(manager.getExtension(MentionExtension).options.appendText).toBe('custom');
      expect(manager.getPreset(SocialPreset).options.appendText).toBe('custom');

      return null;
    };

    render(<Component />);
  });

  it('can receive a manager', () => {
    expect.assertions(1);

    const manager = createSocialManager([]);

    const Component = () => {
      const socialManager = useSocialManager(manager);
      expect(socialManager).toBe(manager);

      return null;
    };

    render(<Component />);
  });
});
