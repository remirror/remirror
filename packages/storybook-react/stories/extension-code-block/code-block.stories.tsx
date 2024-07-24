import Basic from './basic';
import WithIncorrectLanguage from './with-incorrect-language';
import WithTools from './with-tools';

export default { title: 'Extensions / CodeBlock' };

(Basic as any).args = {
  autoLink: true,
  openLinkOnClick: true,
};

export { Basic, WithIncorrectLanguage, WithTools };
