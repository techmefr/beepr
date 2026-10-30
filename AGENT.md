# AGENT.md — beepr (event engine)

## Role
Standalone typed event/notify engine. Exposes `createNotify`,
`mergeEventHandlers`, `createSdkHooks`, `resolveEventHandler`, and its own
`SdkEvent`/`SdkEventHandler`/`SdkNotifyAdapter` types. Built on `hookable`.

## Hard rule — independent of nexdk and shamock
- **Never import `nexdk` or `shamock`.** beepr lives in its own repo now, but the
  rule predates that: it keeps its OWN copy of the `SdkEvent` union and handler
  type — this duplication with nexdk is intentional (the price of
  independence). Keep the union members identical to nexdk's so
  `createNotify(...)` stays assignable to `createSdk({ notify })`.
- Only runtime dependency allowed: `hookable`.

## Build/test
`pnpm build` · `pnpm test`. No workspace, no sibling packages — this repo only
ever builds/tests itself.
