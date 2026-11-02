---
title: Installation & quickstart
description: Install beepr and dispatch your first typed event.
---

beepr is not published to npm yet. Install it from GitHub:

```bash
pnpm add github:techmefr/beepr
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

Only implement the callbacks you need. beepr routes each event name to its callback. Your application decides when to emit.

Next: [events and adapters](/beepr/guides/events/), [redaction](/beepr/guides/redaction/), [handler composition](/beepr/guides/composition/), [multiple listeners](/beepr/guides/hooks/) or the [debug channel](/beepr/guides/debug/).
