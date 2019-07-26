// for development only
import { useContext, useEffect } from 'react';
import { Context } from 'theme-ui';

const parseTypographyGoogleFonts = (typography: any) => {
  const { googleFonts } = typography.options;
  if (!googleFonts) {
    return null;
  }
  const families = googleFonts
    .map(
      ({ name, styles }: { name: string; styles: string[] }) =>
        `${name.split(' ').join('+')}:${styles.join(',')}`,
    )
    .join('|');
  const href = `https://fonts.googleapis.com/css?family=${families}`;
  return href;
};

export const GoogleFonts = () => {
  const { theme } = useContext(Context);
  if (!theme.typography) {
    return null;
  }
  const href = parseTypographyGoogleFonts(theme.typography);

  useEffect(() => {
    if (!href) {
      return;
    }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }, [theme.typography, href]);

  return null;
};

export default GoogleFonts;
