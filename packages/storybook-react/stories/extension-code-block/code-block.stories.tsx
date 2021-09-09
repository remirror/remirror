import Basic from './basic';
import WithIncorrectLanguage from './with-incorrect-language';

export default { title: 'Extensions / CodeBlock' };

(Basic as any).args = {
  autoLink: true,
  openLinkOnClick: true,
};

export { Basic, WithIncorrectLanguage };
