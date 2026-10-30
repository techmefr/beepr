---
title: Multiple listeners
description: Use the hookable API for subscriptions, cleanup and awaited event dispatch.
---

`createSdkHooks()` exposes a hookable instance with the same six event names.

```ts
import { createSdkHooks } from 'beepr'

const hooks = createSdkHooks()
const removeListener = hooks.hook('success', data => {
  console.log('Received', data)
})

await hooks.callHook('success', { id: 1 })
removeListener()
```

Register listeners close to the code that owns them and remove them during cleanup. Await `callHook` when later application work depends on listener completion.

This hook instance is separate from a flat `createNotify` handler: events are not automatically forwarded between them. Choose the API that fits the caller.

See the [API reference](/beepr/reference/beepr/) for exported types.
