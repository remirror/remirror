export * from './bundle-command';
export * from './create-command';

declare global {
  namespace RemirrorCli {
    interface Commands {
      '--version': object;
      '-v': object;
      '--help': object;
      '-h': object;
    }
  }
}
