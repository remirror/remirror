import { useEffect } from 'react';

const ChatRedirectPage = () => {
  useEffect(() => {
    window.location.replace('https://discord.gg/C4cfrMK');
  }, []);

  return null;
};

export default ChatRedirectPage;
