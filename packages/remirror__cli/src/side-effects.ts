import { addMethod, MixedSchema, object } from 'yup';

addMethod<MixedSchema>(object, `atMostOneOf`, function (list: string[]) {
  return this.test({
    name: `atMostOneOf`,
    message: `\${path} must only have at most one of these keys: \${keys}`,
    params: { keys: list.join(`, `) },
    test: (value) => value == null || list.filter((f) => !!value[f]).length <= 1,
  });
});

declare module 'yup' {
  interface Schema<T> {
    atMostOneOf: (keys: string[]) => this;
  }
}
