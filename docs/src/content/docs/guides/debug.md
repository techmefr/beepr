---
title: Debug channel
description: Environment-gated debug output with redaction and no production footprint.
---

`createDebug` gives you three channels: `trace`, `state` and `diagnostic`. Entries only reach adapters when the current environment is in your allow-list.

```ts
import { createConsoleAdapter, createDebug } from 'beepr'

const debug = createDebug({
  environment: 'development',
  environments: ['development', 'staging'],
  adapters: [createConsoleAdapter()],
})

debug.trace('start')
debug.state('cart', { items: 3, token: 'abc' })
debug.diagnostic('slow response', { ms: 1200 })
```

```text
[beepr:trace] start undefined
[beepr:state] cart { items: 3, token: '[redacted]' }
[beepr:diagnostic] slow response { ms: 1200 }
```

The console adapter uses `console.debug` for `trace` and `state`, and `console.warn` for `diagnostic`.

## Gating

- Debug is **off by default**: without `environment` and `environments`, nothing is emitted.
- It is on only when `environment` matches an entry of `environments`. Case and surrounding spaces are ignored.
- `debug.enabled` tells you which.
- When off, calls do nothing: no console output, no adapter call, and `lazy` data is never computed.

## Production guard

`createDebug` throws `DebugEnvironmentError` if the allow-list contains a name starting with `prod`, `prd`, `live`, `release` or `stable` (case and spaces ignored). So `production`, `prod-eu`, `Live` and `release` are all refused.

```ts
import { createDebug, DebugEnvironmentError } from 'beepr'

try {
  createDebug({ environment: 'production', environments: ['production'] })
} catch (error) {
  console.log(error instanceof DebugEnvironmentError)
  console.log((error as Error).message)
}
```

```text
true
Debug cannot be enabled for the production-like environment "production"
```

## Lazy data

Wrap costly data in `lazy` so it is computed only when debug is enabled, once per call.

```ts
import { createDebug, lazy } from 'beepr'

const debug = createDebug({ environment: 'production', environments: ['development'] })

debug.state('snapshot', lazy(() => {
  console.log('computed')
  return { big: true }
}))
```

Nothing is printed here, because `production` is not in the allow-list.

## Redaction and entries

Entry data goes through the [redactor](/beepr/guides/redaction/). Pass extra keys with `redact: ['iban']`. Each entry is a frozen `{ channel, label, data }` object.

## Adapter failures

Adapters implement `onDebug(entry)`. If one throws, the others still run and `debug.*` never throws. The failure goes to `onAdapterError({ name, message })` when given. Otherwise it is printed with `console.error` as `[beepr:debug] Name: message`.
