# @remirror/extension-react-tables

## 1.0.0

> 2021-07-17

### Minor Changes

- [#996](https://github.com/remirror/remirror/pull/996) [`4a00b301d`](https://github.com/remirror/remirror/commit/4a00b301d87f711575cdd30c232dfa086ddc38eb) Thanks [@whawker](https://github.com/whawker)! - Fix to make React tables compatible with Yjs extension

  The controller injection is now done is a single create transaction, rather than an additional transaction. The previous implementation with multiple rapid transactions triggered conflict resolution behaviour in Yjs, leading to unpredictable behaviour.

  Exposes a `createTable` command from the React Tables extension directly

* [#877](https://github.com/remirror/remirror/pull/877) [`033144c84`](https://github.com/remirror/remirror/commit/033144c849b861587a28d1de94b314e02571264a) Thanks [@ocavue](https://github.com/ocavue)! - Add the new `@remirror/extension-react-tables` package.

- [#911](https://github.com/remirror/remirror/pull/911) [`52be2d8c9`](https://github.com/remirror/remirror/commit/52be2d8c9d4b3f20952efc4758e1a9c43a3faa25) Thanks [@ocavue](https://github.com/ocavue)! - Export `@remirror/extension-react-tables`

* [#911](https://github.com/remirror/remirror/pull/911) [`52be2d8c9`](https://github.com/remirror/remirror/commit/52be2d8c9d4b3f20952efc4758e1a9c43a3faa25) Thanks [@ocavue](https://github.com/ocavue)! - - Use the new type `TableCellMenuComponentProps` to replace `TableCellMenuComponentProps` and `TableCellMenuProps`.
  - `TableCellMenu` only accepts one property `Component` now, which replaces the origin propertys `ButtonComponent` and `PopupComponent`.

### Patch Changes

- [#922](https://github.com/remirror/remirror/pull/922) [`18b8d1b2b`](https://github.com/remirror/remirror/commit/18b8d1b2b336e2611c469e7b637f11b00b8b4399) Thanks [@ocavue](https://github.com/ocavue)! - Fix the problem that the insert button fails when there are other nodes below the table.

  Fix the problem that the table menu is always displayed.

* [#919](https://github.com/remirror/remirror/pull/919) [`0b32e1698`](https://github.com/remirror/remirror/commit/0b32e169875c40551898acf29126070d5b5c798f) Thanks [@ocavue](https://github.com/ocavue)! - Downgrade the dependency `jsx-dom` to an earlier version.

- [#997](https://github.com/remirror/remirror/pull/997) [`38a409923`](https://github.com/remirror/remirror/commit/38a40992377fac42ad5b30613a48ab56e69961b2) Thanks [@whawker](https://github.com/whawker)! - Fix exports of Tables extension to expose imports required for React Tables extension

- Updated dependencies [[`8202b65ef`](https://github.com/remirror/remirror/commit/8202b65efbce5a8338c45fd34b3efb676b7e54e7), [`4a00b301d`](https://github.com/remirror/remirror/commit/4a00b301d87f711575cdd30c232dfa086ddc38eb), [`c13db0996`](https://github.com/remirror/remirror/commit/c13db0996ce10677b905057d14d707dc1ac2591d), [`3df15a8a2`](https://github.com/remirror/remirror/commit/3df15a8a2a9f594b48ba2abc755109eaf3ee0999), [`3feb9188a`](https://github.com/remirror/remirror/commit/3feb9188a6747f496ea4ed224357d268cf1da8cc), [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2), [`adfb12a4c`](https://github.com/remirror/remirror/commit/adfb12a4cee7031eec4baa10830b0fc0134ebdc8), [`7d9f43837`](https://github.com/remirror/remirror/commit/7d9f43837e7b83e09c80374f7c09ad489a561cfa), [`3e0925f1d`](https://github.com/remirror/remirror/commit/3e0925f1dc38096dd66f42a808177889cac01418), [`9096de83f`](https://github.com/remirror/remirror/commit/9096de83f50e6c14cde9df920521b274d98e6d87), [`7f3569729`](https://github.com/remirror/remirror/commit/7f3569729c0d843b7745a490feda383b31aa2b7e), [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2), [`6568794ad`](https://github.com/remirror/remirror/commit/6568794ad49328dea88fe06ceb1565cc14ae5eb0), [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2), [`b4dfcad36`](https://github.com/remirror/remirror/commit/b4dfcad364a0b41d321fbd26a97377f2b6d4047c), [`96818fbd2`](https://github.com/remirror/remirror/commit/96818fbd2c95d3df952170d353ef02b777eb1339), [`9096de83f`](https://github.com/remirror/remirror/commit/9096de83f50e6c14cde9df920521b274d98e6d87), [`5f4ea1f1e`](https://github.com/remirror/remirror/commit/5f4ea1f1e245b10f1dc1bfc7a3245cdcf05cf012), [`e9b10fa5a`](https://github.com/remirror/remirror/commit/e9b10fa5a50dd3e342b75b0a852627db99f22dc2), [`38a409923`](https://github.com/remirror/remirror/commit/38a40992377fac42ad5b30613a48ab56e69961b2), [`0adccf9f0`](https://github.com/remirror/remirror/commit/0adccf9f0cabe8dd0386c2b2be99b3430ea47208), [`c13db0996`](https://github.com/remirror/remirror/commit/c13db0996ce10677b905057d14d707dc1ac2591d), [`033144c84`](https://github.com/remirror/remirror/commit/033144c849b861587a28d1de94b314e02571264a), [`6ab7d2224`](https://github.com/remirror/remirror/commit/6ab7d2224d16ba821d8510e0498aaa9c420922c4), [`ac37ea7f4`](https://github.com/remirror/remirror/commit/ac37ea7f4f332d1129b7aeb0a80e19fae6bd2b1c), [`033144c84`](https://github.com/remirror/remirror/commit/033144c849b861587a28d1de94b314e02571264a), [`033144c84`](https://github.com/remirror/remirror/commit/033144c849b861587a28d1de94b314e02571264a), [`b1fc65313`](https://github.com/remirror/remirror/commit/b1fc65313f5be376bb1128c90f54cd1fa168c5c0), [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2), [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2), [`5befadd0d`](https://github.com/remirror/remirror/commit/5befadd0d490cc11e4d16a66d66356ae0a8ed98c), [`6ab7d2224`](https://github.com/remirror/remirror/commit/6ab7d2224d16ba821d8510e0498aaa9c420922c4), [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2), [`9c496262b`](https://github.com/remirror/remirror/commit/9c496262bd09ff21f33de5ae8e5b6b51709021d0), [`0adccf9f0`](https://github.com/remirror/remirror/commit/0adccf9f0cabe8dd0386c2b2be99b3430ea47208), [`9c496262b`](https://github.com/remirror/remirror/commit/9c496262bd09ff21f33de5ae8e5b6b51709021d0), [`7024de573`](https://github.com/remirror/remirror/commit/7024de5738a968f2914a999e570d723899815611), [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2), [`03d0ae485`](https://github.com/remirror/remirror/commit/03d0ae485079a166a223b902ea72cbe62504b0f0), [`033144c84`](https://github.com/remirror/remirror/commit/033144c849b861587a28d1de94b314e02571264a), [`62a494c14`](https://github.com/remirror/remirror/commit/62a494c143157d2fe0483c010845a4c377e8524c), [`63268b8eb`](https://github.com/remirror/remirror/commit/63268b8ebc03bd9b6d410516abb794f872e571c8), [`f52405b4b`](https://github.com/remirror/remirror/commit/f52405b4b27c579cec8c59b6657e6fb66bcf0e7d)]:
  - @remirror/core@1.0.0
  - @remirror/extension-tables@1.0.0
  - @remirror/react-hooks@1.0.0
  - @remirror/react-components@1.0.0
  - @remirror/react-core@1.0.0
  - @remirror/extension-positioner@1.0.0
  - @remirror/core-utils@1.0.0
  - @remirror/icons@1.0.0
  - @remirror/messages@1.0.0
  - @remirror/pm@1.0.0
  - @remirror/preset-core@1.0.0
  - @remirror/theme@1.0.0
