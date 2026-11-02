---
title: Introduction
description: Why beepr exists and what problem it solves.
---

Most event systems tie you to a framework's own bus, or force every listener to match a raw `(event, data)` pair by hand. beepr separates two things:

- **the event vocabulary**: `request`, `success`, `error`, `data`, `complete`, `connected`, `disconnected`;
- **the adapter**: a typed object (`onRequest`, `onSuccess`, `onError`...) that `createNotify` turns into a raw handler.

On top of that, beepr adds two safety nets:

- **redaction**: payloads are masked before adapters see them;
- **debug gating**: debug output only runs in environments you allow.

## Install

beepr is not published to npm yet. Install it from GitHub:

```bash
pnpm add github:techmefr/beepr
```

## A minimal example

```ts
import { createNotify } from 'beepr'

const notify = createNotify({
  onRequest: context => console.log('request', context.resource),
  onSuccess: data => console.log('success', data),
  onError: error => console.error('error', error.message),
})

notify('request', { resource: 'users', payload: { id: 1 } })
notify('success', { id: 1, name: 'Alice' })
```

## Next

- [Redaction](/beepr/guides/redaction/): what gets masked.
- [Debug channel](/beepr/guides/debug/): environment-gated diagnostics.
- [Pairing with nexdk](/beepr/guides/pairing-with-nexdk/): use beepr as nexdk's `notify`.
- [beepr API](/beepr/reference/beepr/): every runtime export.
