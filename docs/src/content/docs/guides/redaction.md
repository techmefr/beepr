---
title: Redaction
description: How beepr masks secrets before payloads reach adapters and debug output.
---

`createNotify` redacts every payload before the adapter callback runs: `request`, `success`, `error`, `data`, `connected` and `disconnected`. Adapters receive masked copies. Your original objects are never changed.

```ts
import { createNotify } from 'beepr'

const notify = createNotify({
  onRequest: context => console.log(context),
})

const payload = { email: 'a@b.c', password: 'hunter2' }
notify('request', { resource: 'login', payload })
console.log(payload.password)
```

```text
{
  resource: 'login',
  payload: { email: 'a@b.c', password: '[redacted]' }
}
hunter2
```

## Options

```ts
import { createNotify } from 'beepr'

const notify = createNotify(
  { onSuccess: data => console.log(data) },
  { redactKeys: ['iban'] },
)

notify('success', { iban: 'FR76', name: 'Alice' })
```

```text
{ iban: '[redacted]', name: 'Alice' }
```

| Option | Effect |
|---|---|
| `redact: false` | Pass payloads through untouched. |
| `redactKeys` | Extra key fragments to mask, added to the defaults. |

## What is masked

**Keys.** A key is masked when, ignoring case and separators, it contains one of: `password`, `passwd`, `secret`, `token`, `apikey`, `authorization`, `cookie`, `credential`, `privatekey`, `sessionid`, `bearer`, `pwd`, `jwt`, `auth`, `otp`, `signature`. So `access_token`, `clientSecret` and `Authorization-Header` are masked. `author` is kept. `otp` only matches as a word, so `hotpot` is kept.

**Values.** Inside any string:

- `Bearer ...` and `Basic ...`, anywhere in the text;
- `token=...`, `password=...` and similar assignments, in or out of a query string;
- bare JWTs.

Other query parameters such as `page=2` are kept.

**Structures.**

| Input | Result |
|---|---|
| Circular reference or depth over 8 | `[truncated]` |
| Object shared in two places | Kept, not truncated |
| Property getter that throws | `[unreadable]` |
| `Error` | `{ name, message }` |
| `Map` | Plain object |
| `Set` | Array |
| `Date` | Unchanged |

## Standalone

`createRedactor` is the same engine, usable on its own. The constants `REDACTED`, `TRUNCATED`, `UNREADABLE` and the list `SENSITIVE_FRAGMENTS` are exported.

```ts
import { createRedactor } from 'beepr'

const redact = createRedactor(['iban'])

console.log(redact({ iban: 'FR76', note: 'Bearer abc.def', page: 2 }))
```

```text
{ iban: '[redacted]', note: '[redacted]', page: 2 }
```
