# AGENT.md — beepr (event engine)

## Role
Standalone typed event/notify engine. Exposes `createNotify`,
`mergeEventHandlers`, `createSdkHooks`, `resolveEventHandler`, and its own
`SdkEvent`/`SdkEventHandler`/`SdkNotifyAdapter` types. Built on `hookable`.

## Hard rule — independent of the rest of the repo
- **Never import `nexdk` or `chaff`.** beepr keeps its OWN copy of the
  `SdkEvent` union and handler type — this duplication with nexdk is
  intentional (the price of independence). Keep the union members identical to
  nexdk's so `createNotify(...)` stays assignable to `createSdk({ notify })`.
- Only runtime dependency allowed: `hookable`.

## Build/test
`pnpm --filter beepr build` · `pnpm --filter beepr test` (passes with nexdk/chaff
absent). Usable on its own as a generic notification bus.
