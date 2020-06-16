import { defineMessage } from '@lingui/macro';

const userMentionAvatarAlt = defineMessage({
  id: 'user.mention.avatar.alt',
  comment: 'The alt text for the user mention avatar.',
  message: 'Avatar for { name }',
});

/**
 * The messages used within the component. They aren't currently being used.
 */
export const messages = { userMentionAvatarAlt };
