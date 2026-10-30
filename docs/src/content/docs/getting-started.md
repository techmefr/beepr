---
title: Installation & quickstart
description: Install beepr and dispatch your first typed event.
---

Install the standalone event engine:

```bash
pnpm add beepr
```

Create an adapter and emit events through the returned handler:

```ts
import { createNotify } from 'beepr'

const notify = createNotify({
  onRequest: ({ resource }) => console.log('Loading', resource),
  onSuccess: data => console.log('Loaded', data),
  onError: error => console.error(error.message),
})

notify('request', { resource: 'products' })
notify('success', [{ id: 1, name: 'Sample' }])
notify('error', { message: 'Could not load products' })
```

Only implement the callbacks you need. beepr routes event names to the corresponding callback; your application decides when to emit them.

Continue with [events and adapters](/beepr/guides/events/), [handler composition](/beepr/guides/composition/) or [multiple listeners](/beepr/guides/hooks/).
