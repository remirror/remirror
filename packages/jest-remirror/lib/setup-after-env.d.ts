declare global {
  namespace jest {
    interface MatcherUtils {
      currentTestName?: string;
      snapshotState: any;
    }
  }
}
export {};
// # sourceMappingURL=setup-after-env.d.ts.map
