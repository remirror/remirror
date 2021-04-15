import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import { ReactElement } from 'react';
import { cx, isString } from 'remirror';

import { ExternalIcon } from '../components/external-icon';
import styles from './styles.module.css';

const features = [
  {
    title: <>Advanced Features</>,
    imageUrl: 'img/banner-advanced.svg',
    description: (
      <>
        Designed to cater to a huge selection of use cases, supporting fully collaborative editors,
        embedded content, social functionality and more.
      </>
    ),
  },
  {
    title: <>Multi Platform</>,
    imageUrl: 'img/banner-multiplatform.svg',
    description: (
      <>
        Designed to run on all JavaScript enabled platforms. Build apps for NodeJS, for mobile, for
        desktop and for the browser.
      </>
    ),
  },
  {
    title: <>Multi Framework</>,
    imageUrl: 'img/banner-multiframework.svg',
    description: (
      <>
        A multi-framework text editor. It supports <code>React</code>, the pure <code>dom</code> and
        support is coming for <code>Angular</code>, <code>Svelte</code> and <code>Ember</code>.
      </>
    ),
  },
];

interface FeatureProps {
  imageUrl: string;
  title: ReactElement;
  description: ReactElement;
}

const Feature = (props: FeatureProps) => {
  const { imageUrl, title, description } = props;
  const imgUrl = useBaseUrl(imageUrl);

  return (
    <div className={cx('card', styles.feature, 'shadow--md')}>
      {imgUrl && (
        <div className='text--center'>
          <img className={styles.featureImage} src={imgUrl} alt={isString(title) ? title : ''} />
        </div>
      )}
      <div className='card__header'>
        <h3>{title}</h3>
      </div>
      <div className='card__body'>
        <p>{description}</p>
      </div>
    </div>
  );
};

const BannerHeader = () => {
  return (
    <svg viewBox='0 0 447 61' className={cx(styles.bannerHeader, styles.bottomSpacing)}>
      <title>Remirror Banner</title>
      <g fill='#FFF' fillRule='nonzero'>
        <path d='M45.88 11.23a12.62 12.62 0 01-9.27 3.85h-5.5a14.39 14.39 0 00-10.71 4.54A14.92 14.92 0 0016 30.43v16.63a13.28 13.28 0 01-4.07 9.71C9.223 59.483 5.393 60.837.44 60.83v-30.4a28.86 28.86 0 019-21.41A29.85 29.85 0 0131.1.17h18.64c0 4.8-1.287 8.487-3.86 11.06zM80.79 60.83A29.67 29.67 0 0159.16 52a28.9 28.9 0 01-9-21.41 29.15 29.15 0 019-21.48A29.58 29.58 0 0180.79.19h18.7c0 4.8-1.297 8.487-3.89 11.06a12.78 12.78 0 01-9.32 3.85h-5.49a14.18 14.18 0 00-10.67 4.61 15.23 15.23 0 00-4.39 10.88 15 15 0 004.39 10.82 14.29 14.29 0 0010.67 4.53h5.49a12.78 12.78 0 019.32 3.85c2.593 2.573 3.89 6.26 3.89 11.06l-18.7-.02zM95.6 34.05a12.76 12.76 0 01-9.32 3.87h-9.49a7.19 7.19 0 01-5.28-2.11 7.1 7.1 0 01-2.14-5.27 7.35 7.35 0 012.14-5.35A7.06 7.06 0 0176.79 23h22.7c0 4.787-1.297 8.47-3.89 11.05zM199.27 56.77a13.28 13.28 0 01-4.07-9.71V30.57a15.3 15.3 0 00-4.35-10.92 14.79 14.79 0 00-21.42 0A15.18 15.18 0 00165 30.57v30.26c-4.947 0-8.777-1.353-11.49-4.06a13.24 13.24 0 01-4.07-9.71V30.57a15.27 15.27 0 00-4.36-10.92 14.78 14.78 0 00-21.41 0 15.18 15.18 0 00-4.42 10.88v16.53a13.27 13.27 0 01-4 9.74c-2.68 2.69-6.53 4-11.52 4V30.57a29.11 29.11 0 019-21.48 30.79 30.79 0 0144.57 1.28 31.33 31.33 0 0110.35-7.49A30 30 0 01180.14.17a29.61 29.61 0 0121.63 8.92 29.19 29.19 0 019 21.48v30.26c-4.953 0-8.787-1.353-11.5-4.06zM220 56.77a13.28 13.28 0 01-4-9.71V.17c4.953 0 8.783 1.353 11.49 4.06a13.28 13.28 0 014.07 9.71v46.89c-4.967 0-8.82-1.353-11.56-4.06zM283.63 11.23a12.64 12.64 0 01-9.28 3.85h-5.49a14.39 14.39 0 00-10.71 4.54 14.92 14.92 0 00-4.42 10.81v16.63a13.28 13.28 0 01-4.07 9.71c-2.71 2.71-6.55 4.06-11.49 4.06v-30.4a28.83 28.83 0 019-21.41A29.83 29.83 0 01268.83.17h18.63c.02 4.8-1.257 8.487-3.83 11.06zM334.59 11.23a12.63 12.63 0 01-9.27 3.85h-5.5a14.39 14.39 0 00-10.71 4.54 14.92 14.92 0 00-4.42 10.81v16.63a13.28 13.28 0 01-4.07 9.71c-2.707 2.713-6.537 4.067-11.49 4.06v-30.4a28.86 28.86 0 019-21.41A29.85 29.85 0 01319.79.17h18.63c.02 4.8-1.257 8.487-3.83 11.06zM361.15 60.83A29.67 29.67 0 01339.52 52a28.9 28.9 0 01-9-21.41 29.15 29.15 0 019-21.48c11.979-11.894 31.311-11.894 43.29 0a29.11 29.11 0 019 21.48 28.86 28.86 0 01-9 21.41 29.81 29.81 0 01-21.66 8.83zm0-45.75a14.23 14.23 0 00-10.71 4.57 15.3 15.3 0 00-4.35 10.92 15 15 0 004.39 10.82 14.87 14.87 0 0021.37 0 15 15 0 004.43-10.82 15.17 15.17 0 00-4.43-10.92 14.38 14.38 0 00-10.7-4.57zM442.73 11.23a12.66 12.66 0 01-9.28 3.85H428a14.37 14.37 0 00-10.7 4.54 14.89 14.89 0 00-4.43 10.81v16.63a13.28 13.28 0 01-4.07 9.71c-2.707 2.713-6.537 4.067-11.49 4.06v-30.4a28.86 28.86 0 019-21.41A29.85 29.85 0 01428 .17h18.63c-.033 4.8-1.333 8.487-3.9 11.06z' />
      </g>
    </svg>
  );
};

const BannerPhone = () => {
  return <img src='/img/phone.svg' className={styles.bannerPhone} />;
};

const BannerLaptop = () => {
  return <img src='/img/laptop.svg' className={styles.bannerLaptop} />;
};

const Home = () => {
  const context = useDocusaurusContext();
  const { siteConfig } = context;

  return (
    <div className={styles.mainBackground}>
      <Layout className='asdfasdf'>
        <header className={cx('hero', styles.heroBanner)}>
          <div className={cx(styles.container)}>
            <BannerHeader />
            <h4 className={cx('hero__subtitle', styles.bottomSpacing)}>{siteConfig?.tagline}</h4>
            <div className={styles.buttons}>
              <Link className={cx(styles.getStarted)} to={useBaseUrl('docs')}>
                Documentation
              </Link>
              <Link className={cx(styles.getStarted)} href='https://github.com/remirror/remirror'>
                GitHub <ExternalIcon />
              </Link>
            </div>
            <BannerPhone />
          </div>
        </header>
        <main className={styles.main}>
          {features && features.length > 0 && (
            <section className={styles.features}>
              {features.map((props, idx) => (
                <Feature key={idx} {...props} />
              ))}
            </section>
          )}
          <BannerLaptop />
        </main>
      </Layout>
    </div>
  );
};

export default Home;
