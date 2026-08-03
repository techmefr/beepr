---
title: beepr API reference
description: Every runtime export of the beepr package.
---

## `createNotify(adapter)`

```ts
function createNotify(adapter: SdkNotifyAdapter): SdkEventHandler
```

Turns a typed adapter into a raw `SdkEventHandler`. `adapter` fields, all optional:

| Field | Type | Fires on |
|-------|------|----------|
| `onRequest` | `(ctx: { resource?: string, payload?: unknown }) => void` | `'request'` |
| `onSuccess` | `(data?: unknown) => void` | `'success'` |
| `onError` | `(error: { message: string, errors?: Record<string, string[]> }) => void` | `'error'` — `message` defaults to `'Unknown error'` if the emitted data didn't carry one |
| `onData` | `(data?: unknown) => void` | `'data'` |
| `onConnected` | `(data?: unknown) => void` | `'connected'` |
| `onDisconnected` | `(data?: unknown) => void` | `'disconnected'` |

## `mergeEventHandlers(a, b)`

```ts
function mergeEventHandlers(
  a: SdkEventHandler | undefined,
  b: SdkEventHandler | undefined,
): SdkEventHandler | undefined
```

Combines two handlers into one. If either side is `undefined`, the other is returned untouched; otherwise both are invoked, in order (`a` then `b`).

## `createSdkHooks()`

```ts
function createSdkHooks(): SdkHooksInstance
```

Returns a [`hookable`](https://github.com/unjs/hookable) instance typed with the `SdkHookMap` — one hook per event name. Use it when you want `hookable`'s own API (multiple listeners, `hookOnce`, async hook chains) instead of a single flat handler.

## `resolveEventHandler(...)`

Internal helper used by `createNotify` and `createSdkHooks` to normalize a handler/adapter into the raw event-dispatch shape. Exported for advanced use (e.g. building your own adapter-like abstraction), but most code should reach for `createNotify` or `createSdkHooks` directly.

## Types

| Type | Role |
|------|------|
| `SdkEvent` | `'request' \| 'success' \| 'error' \| 'data' \| 'connected' \| 'disconnected'`. |
| `SdkEventHandler` | `(event: SdkEvent, data?: unknown) => void` — the raw handler shape every adapter compiles down to. |
| `SdkNotifyAdapter` | The typed object `createNotify` accepts — see the field table above. |
| `SdkHookMap` | The `hookable` hook map type used by `createSdkHooks`. |
| `SdkHooksInstance` | The return type of `createSdkHooks`. |
