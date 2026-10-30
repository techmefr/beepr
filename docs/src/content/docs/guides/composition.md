---
title: Compose handlers
description: Combine global and local behavior without replacing either handler.
---

## Global and local behavior

```ts
import { createNotify, mergeEventHandlers } from 'beepr'

const globalNotify = createNotify({
  onError: error => console.error('Global', error.message),
})
const localNotify = createNotify({
  onError: error => console.log('Form', error.errors),
})
const notify = mergeEventHandlers(globalNotify, localNotify)

notify?.('error', { message: 'Invalid product', errors: { name: ['Required'] } })
```

Both handlers receive the same event and payload, with the global handler called first. If one handler is undefined, the other is returned unchanged; if both are undefined, the result is undefined.

Composition does not isolate failures: if the first handler throws, execution stops before the second. It does not await returned promises either.

## Pair with neXdk

Pass a beepr handler as neXdk's `notify` option. Neither library needs to depend on the other. See [pairing with neXdk](/beepr/guides/pairing-with-nexdk/).
