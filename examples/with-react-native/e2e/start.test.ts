describe('Example', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should have welcome screen', async () => {
    await expect(element(by.id('entry'))).toBeVisible();
  });

  it('should show hello screen after tap', async () => {
    await element(by.id('performance')).tap();
    await expect(element(by.id('performance_screen'))).toBeVisible();
  });

  it('should show world screen after tap', async () => {
    await element(by.id('performance')).tap();
    await element(by.id('start_performance')).tap();
    // await expect(element(by.text('World!!!'))).toBeVisible();
  });
});
