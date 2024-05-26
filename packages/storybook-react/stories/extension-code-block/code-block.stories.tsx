import Basic from './basic';
import WithFormatter from './with-formatter';
import WithIncorrectLanguage from './with-incorrect-language';
import WithLanguageSelect from './with-language-select';

export default { title: 'Extensions / CodeBlock' };

(Basic as any).args = {
  autoLink: true,
  openLinkOnClick: true,
};

export { Basic, WithFormatter, WithIncorrectLanguage, WithLanguageSelect };
