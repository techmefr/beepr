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

Both handlers receive the same event and payload. The global one runs first. If one handler is `undefined`, the other is returned as is. If both are `undefined`, the result is `undefined`.

## Failures are isolated

Each handler runs even if the other throws. After both ran, the first error is rethrown.

```ts
import { mergeEventHandlers } from 'beepr'

const notify = mergeEventHandlers(
  () => {
    throw new Error('first failed')
  },
  () => console.log('second still ran'),
)

try {
  notify?.('success')
} catch (error) {
  console.log((error as Error).message)
}
```

```text
second still ran
first failed
```

Promises returned by handlers are not awaited.

## Pair with neXdk

Pass a beepr handler as neXdk's `notify` option. See [pairing with neXdk](/beepr/guides/pairing-with-nexdk/).
