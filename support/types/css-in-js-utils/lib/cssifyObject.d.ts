// tslint:disable:file-name-casing
declare module 'css-in-js-utils/lib/cssifyObject' {
  import * as CSS from 'csstype';

  export default function(obj: CSS.Properties<any>): string;
}
