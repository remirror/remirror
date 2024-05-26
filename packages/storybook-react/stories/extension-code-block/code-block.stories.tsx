import Basic from './basic';
import WithFormatCode from './with-format-code';
import WithIncorrectLanguage from './with-incorrect-language';
import WithLanguageSelect from './with-language-select';

export default { title: 'Extensions / CodeBlock' };

(Basic as any).args = {
  autoLink: true,
  openLinkOnClick: true,
};

export { Basic, WithFormatCode, WithIncorrectLanguage, WithLanguageSelect };
