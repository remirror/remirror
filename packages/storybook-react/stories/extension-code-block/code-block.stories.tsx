import Basic from './basic';
import WithLanguageSelect from './width-language-select';
import WithIncorrectLanguage from './with-incorrect-language';

export default { title: 'Extensions / CodeBlock' };

(Basic as any).args = {
  autoLink: true,
  openLinkOnClick: true,
};

export { Basic, WithIncorrectLanguage, WithLanguageSelect };
