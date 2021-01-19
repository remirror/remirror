/**
 * @module
 *
 * The different loading components.
 */

import type { FC } from 'react';
import ContentLoader from 'react-content-loader';

/**
 * The loading svg for when the code editor is loading.
 */
export const LoadingComplex: FC = () => {
  return (
    <ContentLoader
      viewBox='0 0 800 400'
      width='100%'
      speed={2}
      backgroundColor='#f3f3f3'
      foregroundColor='#d9b9f3'
    >
      <circle cx='472' cy='159' r='7' />
      <rect x='487' y='154' rx='5' ry='5' width='220' height='10' />
      <circle cx='472' cy='190' r='7' />
      <rect x='487' y='184' rx='5' ry='5' width='220' height='10' />
      <circle cx='472' cy='219' r='7' />
      <rect x='487' y='214' rx='5' ry='5' width='220' height='10' />
      <circle cx='472' cy='249' r='7' />
      <rect x='487' y='244' rx='5' ry='5' width='220' height='10' />
      <rect x='64' y='18' rx='0' ry='0' width='346' height='300' />
      <rect x='229' y='300' rx='0' ry='0' width='0' height='0' />
      <rect x='111' y='340' rx='0' ry='0' width='0' height='0' />
      <rect x='121' y='342' rx='0' ry='0' width='0' height='0' />
      <rect x='10' y='20' rx='0' ry='0' width='40' height='44' />
      <rect x='10' y='80' rx='0' ry='0' width='40' height='44' />
      <rect x='10' y='140' rx='0' ry='0' width='40' height='44' />
      <rect x='194' y='329' rx='0' ry='0' width='0' height='0' />
      <rect x='192' y='323' rx='0' ry='0' width='0' height='0' />
      <rect x='185' y='323' rx='0' ry='0' width='0' height='0' />
      <rect x='10' y='200' rx='0' ry='0' width='40' height='44' />
      <rect x='470' y='18' rx='0' ry='0' width='300' height='25' />
      <rect x='470' y='58' rx='0' ry='0' width='300' height='6' />
      <rect x='470' y='68' rx='0' ry='0' width='300' height='6' />
      <rect x='470' y='78' rx='0' ry='0' width='300' height='6' />
      <rect x='798' y='135' rx='0' ry='0' width='0' height='0' />
      <rect x='731' y='132' rx='0' ry='0' width='0' height='0' />
      <rect x='470' y='99' rx='0' ry='0' width='70' height='30' />
      <rect x='560' y='99' rx='0' ry='0' width='70' height='30' />
    </ContentLoader>
  );
};

/**
 * Generic content is loading.
 */
export const LoadingContent: FC = () => (
  <ContentLoader
    speed={2}
    width='100%'
    viewBox='0 0 340 84'
    backgroundColor='#f3f3f3'
    foregroundColor='#d9b9f3'
  >
    <rect x='0' y='0' rx='3' ry='3' width='67' height='11' />
    <rect x='76' y='0' rx='3' ry='3' width='140' height='11' />
    <rect x='127' y='48' rx='3' ry='3' width='53' height='11' />
    <rect x='187' y='48' rx='3' ry='3' width='72' height='11' />
    <rect x='18' y='48' rx='3' ry='3' width='100' height='11' />
    <rect x='0' y='71' rx='3' ry='3' width='37' height='11' />
    <rect x='18' y='23' rx='3' ry='3' width='140' height='11' />
    <rect x='166' y='23' rx='3' ry='3' width='173' height='11' />
  </ContentLoader>
);

export const LoadingCode: FC = () => (
  <ContentLoader
    speed={2}
    width='100%'
    viewBox='0 0 400 130'
    backgroundColor='#f3f3f3'
    foregroundColor='#d9b9f3'
  >
    <rect x='0' y='0' rx='3' ry='3' width='70' height='10' />
    <rect x='80' y='0' rx='3' ry='3' width='100' height='10' />
    <rect x='190' y='0' rx='3' ry='3' width='10' height='10' />
    <rect x='15' y='20' rx='3' ry='3' width='130' height='10' />
    <rect x='155' y='20' rx='3' ry='3' width='130' height='10' />
    <rect x='15' y='40' rx='3' ry='3' width='90' height='10' />
    <rect x='115' y='40' rx='3' ry='3' width='60' height='10' />
    <rect x='185' y='40' rx='3' ry='3' width='60' height='10' />
    <rect x='0' y='60' rx='3' ry='3' width='30' height='10' />
    <rect x='15' y='80' rx='3' ry='3' width='70' height='10' />
    <rect x='95' y='80' rx='3' ry='3' width='60' height='10' />
    <rect x='165' y='80' rx='3' ry='3' width='30' height='10' />
    <rect x='15' y='100' rx='3' ry='3' width='110' height='10' />
    <rect x='135' y='100' rx='3' ry='3' width='100' height='10' />
    <rect x='0' y='120' rx='3' ry='3' width='70' height='10' />
  </ContentLoader>
);
