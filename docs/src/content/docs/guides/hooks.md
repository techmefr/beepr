---
title: Multiple listeners
description: Use the hookable API for subscriptions, cleanup and awaited event dispatch.
---

`createSdkHooks()` returns a hookable instance with the same six event names.

```ts
import { createSdkHooks } from 'beepr'

const hooks = createSdkHooks()
const removeListener = hooks.hook('success', data => {
  console.log('Received', data)
})

await hooks.callHook('success', { id: 1 })
removeListener()
```

Register listeners close to the code that owns them and remove them on cleanup. Await `callHook` when later work depends on the listeners.

## Use hooks as a handler

`resolveEventHandler(local, global)` returns `local` when it is defined. Otherwise it returns a handler that calls `global.callHook(event, data)`. The call is not awaited.

```ts
import { createSdkHooks, resolveEventHandler } from 'beepr'

const hooks = createSdkHooks()
hooks.hook('success', data => console.log('hook', data))

const handler = resolveEventHandler(undefined, hooks)
handler('success', { id: 1 })
```

A flat `createNotify` handler and a hooks instance are separate. Events are not forwarded between them unless you wire them.

See the [API reference](/beepr/reference/beepr/).
