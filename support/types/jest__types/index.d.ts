declare module '@jest/types' {
  import * as Config from './Config';
  import * as Console from './Console';
  import * as Global from './Global';
  import * as Matchers from './Matchers';
  import * as SourceMaps from './SourceMaps';
  import * as TestResult from './TestResult';
  export { Config, Console, Matchers, SourceMaps, TestResult, Global };
}
