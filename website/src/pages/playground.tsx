// import '@fontsource/fira-code';
// import '@fontsource/rubik';
import Head from '@docusaurus/Head';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styled from '@emotion/styled';
import AnnouncementBar from '@theme/AnnouncementBar';
import Navbar from '@theme/Navbar';
import ThemeProvider from '@theme/ThemeProvider';
import UserPreferencesProvider from '@theme/UserPreferencesProvider';

const PlaygroundPage = (props: any) => {
  const { siteConfig } = useDocusaurusContext();
  const { favicon, url: siteUrl } = siteConfig;
  const defaultImage = siteConfig?.themeConfig?.image;
  const { description, image, keywords, permalink, version } = props;
  const metaImage = image || defaultImage;
  const metaImageUrl = useBaseUrl(metaImage, { absolute: true });
  const faviconUrl = useBaseUrl(favicon);

  return (
    <PageWrapper>
      <ThemeProvider>
        <UserPreferencesProvider>
          <Head>
            {/* TODO: Do not assume that it is in english language site */}
            <html lang='en' />
            <link
              href='https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500;600;700&display=swap'
              rel='stylesheet'
            />
            <script src='https://unpkg.com/@babel/standalone/babel.min.js' />
            <script src='https://unpkg.com/prettier@2.1.2/standalone.js' />
            <script src='https://unpkg.com/prettier@2.1.2/parser-typescript.js' />
            <title>Remirror Playground</title>
            <meta property='og:title' content='Remirror Playground' />
            {favicon ?? <link rel='shortcut icon' href={faviconUrl} />}
            {description ?? <meta name='description' content={description} />}
            {description ?? <meta property='og:description' content={description} />}
            {version ?? <meta name='docsearch:version' content={version} />}
            {keywords?.length ?? <meta name='keywords' content={keywords?.join(',')} />}
            {metaImage ?? <meta property='og:image' content={metaImageUrl} />}
            <meta property='twitter:image' content={metaImageUrl} />
            {metaImage ?? <meta name='twitter:image:alt' content='Image for Remirror Playground' />}
            {permalink ?? <meta property='og:url' content={siteUrl + permalink} />}
            {permalink ?? <link rel='canonical' href={siteUrl + permalink} />}
            <meta name='twitter:card' content='summary_large_image' />
          </Head>
          <AnnouncementBar />
          <Navbar />
          <PlaygroundWrapper>
            <div>The playground is currently being reworked.</div>
          </PlaygroundWrapper>
        </UserPreferencesProvider>
      </ThemeProvider>
    </PageWrapper>
  );
};

const PageWrapper = styled.div`
  width: 100%;
  height: 100vh;

  .navbar--fixed-top {
    position: fixed;
  }
`;

const PlaygroundWrapper = styled.div`
  margin-top: 64px;
  height: 100px;
  max-height: 100px;
`;

export default PlaygroundPage;
