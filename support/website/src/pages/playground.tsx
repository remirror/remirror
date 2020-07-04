import Head from '@docusaurus/Head';
import Layout from '@theme/Layout';
import React from 'react';

import { Playground } from '@remirror/playground';

import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';

import ThemeProvider from '@theme/ThemeProvider';
import UserPreferencesProvider from '@theme/UserPreferencesProvider';
import AnnouncementBar from '@theme/AnnouncementBar';
import Navbar from '@theme/Navbar';
import Footer from '@theme/Footer';

const PlaygroundPage = (props: any) => {
  const { siteConfig } = useDocusaurusContext();
  const { favicon, title: siteTitle, url: siteUrl } = siteConfig!;

  const defaultImage = siteConfig?.themeConfig?.image;

  const { children, title, noFooter, description, image, keywords, permalink, version } = props;
  const metaTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const metaImage = image || defaultImage;
  const metaImageUrl = useBaseUrl(metaImage, { absolute: true });
  const faviconUrl = useBaseUrl(favicon);

  return (
    <div className='playground'>
      <ThemeProvider>
        <UserPreferencesProvider>
          <Head>
            {/* TODO: Do not assume that it is in english language */}
            <html lang='en' />
            <script src='https://unpkg.com/@babel/standalone/babel.min.js'></script>
            {metaTitle && <title>{metaTitle}</title>}
            {metaTitle && <meta property='og:title' content={metaTitle} />}
            {favicon && <link rel='shortcut icon' href={faviconUrl} />}
            {description && <meta name='description' content={description} />}
            {description && <meta property='og:description' content={description} />}
            {version && <meta name='docsearch:version' content={version} />}
            {keywords && keywords.length && <meta name='keywords' content={keywords.join(',')} />}
            {metaImage && <meta property='og:image' content={metaImageUrl} />}
            {metaImage && <meta property='twitter:image' content={metaImageUrl} />}
            {metaImage && <meta name='twitter:image:alt' content={`Image for ${metaTitle}`} />}
            {permalink && <meta property='og:url' content={siteUrl + permalink} />}
            {permalink && <link rel='canonical' href={siteUrl + permalink} />}
            <meta name='twitter:card' content='summary_large_image' />
          </Head>
          <AnnouncementBar />
          <Navbar />
          <Head></Head>
          <div className='custom-main-wrapper'>
            <Playground />
          </div>
          {!noFooter && <Footer />}
        </UserPreferencesProvider>
      </ThemeProvider>
    </div>
  );
};

export default PlaygroundPage;
