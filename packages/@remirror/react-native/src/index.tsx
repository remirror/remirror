export default {
  multiply(a: number, b: number): Promise<number> {
    return Promise.resolve(a * b);
  },
};
