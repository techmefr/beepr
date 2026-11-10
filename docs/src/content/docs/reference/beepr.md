---
title: beepr API reference
description: Every runtime export of the beepr package.
---

## `createNotify(adapter, options?)`

```ts
function createNotify(adapter: SdkNotifyAdapter, options?: NotifyOptions): SdkEventHandler
```

Turns a typed adapter into a raw `SdkEventHandler`. Every payload is redacted first. Adapter fields, all optional:

| Field | Type | Fires on |
|-------|------|----------|
| `onRequest` | `(context: RequestContext) => void` | `'request'`; an object payload is the context, any other payload becomes `{ payload }`, no payload gives `{}` |
| `onSuccess` | `(context: SuccessContext) => void` | `'success'`; an object payload is the context, any other payload becomes `{ data }`, no payload gives `{}` |
| `onError` | `(error: ErrorContext) => void` | `'error'`; `message` defaults to `'Unknown error'`; `status`, `kind`, `resource`, `method` are copied when they have the right type; field names under `errors` are not redacted, messages are redacted by value |
| `onData` | `(data?: unknown) => void` | `'data'` |
| `onComplete` | `(data?: unknown) => void` | `'complete'` |
| `onConnected` | `(data?: unknown) => void` | `'connected'` |
| `onDisconnected` | `(data?: unknown) => void` | `'disconnected'` |
| `onDebug` | `(entry: DebugEntry) => void` | Debug entries, see `createDebug` |

In the three contexts, `resource`, `method`, `kind` (strings) and `status` (number) are dropped when they have another type; the other keys of a request or success object are kept. The error context keeps only its typed fields, `message` and `errors`.

**Breaking change** (since the call context commit): `onSuccess` used to receive the raw payload, it now receives a `SuccessContext`. A handler written as `onSuccess: (data) => ...` for a non-nexdk emitter must read `data.data` for a non-object payload.

`NotifyOptions`:

| Option | Type | Effect |
|--------|------|--------|
| `redact` | `boolean` | `false` disables redaction. |
| `redactKeys` | `readonly string[]` | Extra key fragments to mask. |

## `mergeEventHandlers(global, local)`

```ts
function mergeEventHandlers(
  global: SdkEventHandler | undefined,
  local: SdkEventHandler | undefined,
): SdkEventHandler | undefined
```

If one side is `undefined`, returns the other. Otherwise calls `global` then `local`. Each handler runs even if the other throws. The first error is rethrown afterwards.

## `resolveEventHandler(local, global)`

```ts
function resolveEventHandler(
  local: SdkEventHandler | undefined,
  global: HookCaller,
): SdkEventHandler
```

Returns `local` if defined. Otherwise returns a handler that calls `global.callHook(event, data)` without awaiting.

## `createRedactor(extraKeys?)`

```ts
function createRedactor(extraKeys?: readonly string[]): (value: unknown) => unknown
```

Returns a function that makes a masked copy of any value. See [Redaction](/beepr/guides/redaction/).

| Constant | Value |
|----------|-------|
| `REDACTED` | `'[redacted]'` |
| `TRUNCATED` | `'[truncated]'` |
| `UNREADABLE` | `'[unreadable]'` |
| `SENSITIVE_FRAGMENTS` | Default key fragments (`readonly string[]`). |

## `createDebug(options?)`

```ts
function createDebug(options?: DebugOptions): Debug
```

| Option | Type | Role |
|--------|------|------|
| `environment` | `string` | Current environment. |
| `environments` | `readonly string[]` | Allow-list. Production-like names throw. |
| `adapters` | `readonly SdkNotifyAdapter[]` | Receive entries via `onDebug`. |
| `redact` | `readonly string[]` | Extra key fragments to mask. |
| `onAdapterError` | `(failure: { name, message }) => void` | Called when an adapter throws. |

`Debug` has `enabled: boolean` and the methods `trace`, `state` and `diagnostic`, each `(label: string, data?: unknown) => void`. See [Debug channel](/beepr/guides/debug/).

## `DebugEnvironmentError`

Thrown by `createDebug` for production-like allow-list names. `name` is `'DebugEnvironmentError'`.

## `lazy(resolve)`

```ts
function lazy(resolve: () => unknown): LazyData
```

Defers data until debug is enabled.

## `createConsoleAdapter()`

```ts
function createConsoleAdapter(): SdkNotifyAdapter
```

Returns an adapter with `onDebug` only: it is a debug-channel adapter. Passed alone to `createNotify`, it prints nothing for `request`, `success`, `error`, `data`, `complete`, `connected` and `disconnected`; give it to `createDebug({ adapters })`, and write your own `onSuccess` and `onError` for notifications. It never prints outside the debug allow-list. Prints `[beepr:<channel>] <label>` plus data, with `console.warn` for `diagnostic` and `console.debug` otherwise.

## Types

| Type | Role |
|------|------|
| `SdkEvent` | `'request' \| 'success' \| 'error' \| 'data' \| 'complete' \| 'connected' \| 'disconnected'`. |
| `SdkEventHandler` | `(event: SdkEvent, data?: unknown) => void`. |
| `SdkNotifyAdapter` | The adapter object accepted by `createNotify`. |
| `NotifyOptions` | `{ redact?: boolean, redactKeys?: readonly string[] }`. |
| `CallContext` | `{ resource?: string, method?: string }`. |
| `RequestContext` | `CallContext & { payload?: unknown }`. |
| `SuccessContext` | `CallContext & { data?: unknown }`. |
| `ErrorContext` | `CallContext & { message: string, errors?: Record<string, string[]>, status?: number, kind?: ErrorKind }`. |
| `ErrorKind` | `'timeout' \| 'abort' \| 'network' \| 'http'`. |
| `HookCaller` | `{ callHook(event, data?) }`, accepted by `resolveEventHandler` (a `hookable` instance fits). |
| `DebugChannel` | `'trace' \| 'state' \| 'diagnostic'`. |
| `DebugEntry` | `{ readonly channel, readonly label, readonly data? }`. |
| `DebugOptions`, `Debug`, `DebugData`, `DebugFailure`, `LazyData` | Debug types. |
