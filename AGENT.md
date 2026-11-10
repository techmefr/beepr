# AGENT.md — beepr (event engine)

## Role
Standalone typed event/notify engine with no runtime dependency. Public exports:

- `createNotify(adapter, options?)` with `NotifyOptions { redact, redactKeys }`; `onRequest(RequestContext)`, `onSuccess(SuccessContext)`, `onError(ErrorContext)`
- `mergeEventHandlers`, `resolveEventHandler` (takes any `HookCaller { callHook }`)
- `createRedactor`, `REDACTED`, `TRUNCATED`, `UNREADABLE`, `SENSITIVE_FRAGMENTS`
- `createDebug`, `DebugEnvironmentError`, `lazy`, `createConsoleAdapter`
- Types: `SdkEvent`, `SdkEventHandler`, `CallContext`, `RequestContext`, `SuccessContext`, `ErrorContext`, `ErrorKind`, `SdkNotifyAdapter`, `NotifyOptions`, `DebugChannel`, `DebugEntry`, `DebugOptions`, `Debug`

## Hard rule — independent of nexdk and shamock
- **Never import `nexdk` or `shamock`.** beepr keeps its OWN copy of the
  `SdkEvent` union and handler type. This duplication is intentional. Keep the
  union members identical to nexdk's so `createNotify(...)` stays assignable to
  `createSdk({ notify })`.
- No runtime dependency.

## Invariants
- Every payload (`request`, `success`, `error`, `data`, `complete`, `connected`, `disconnected`) goes through the redactor before reaching an adapter. Adapters get masked copies. `redact: false` is the only opt-out.
- Debug is off unless `environment` is in the `environments` allow-list (case and spaces ignored). Allow-list names starting with `prod`, `prd`, `live`, `release` or `stable` throw `DebugEnvironmentError`.
- `onError` gets `message` (default `Unknown error`), `errors`, and `status` (number), `kind` (string), `resource`, `method` (strings) only when present with that type, after redaction. `onRequest` and `onSuccess` get the redacted object payload with the same typed fields checked (other keys kept), a non-object payload as `{ payload }` / `{ data }`, nothing as `{}` (`src/context.ts`). Breaking for `onSuccess`, which used to get the raw payload. The context types mirror nexdk structurally, never by import.
- Under `errors` of an `error` event, field names are never matched as sensitive keys (messages stay `Record<string, string[]>`); each message is still redacted by value.
- `createConsoleAdapter` implements `onDebug` only; it prints no notify event.
- A disabled debug never evaluates `lazy` data and never writes to the console.
- `mergeEventHandlers` runs both handlers, isolates each, rethrows the first error.
- The redactor tracks only the current path: shared objects are not marked `[truncated]`, only cycles and depth over 8.

## Build/test
`pnpm build` · `pnpm test` · `pnpm typecheck`. Docs: `pnpm --filter docs build`.
No sibling packages — this repo only ever builds/tests itself.
Docs are plain Markdown in `docs/src/content/docs`, sidebar in `docs/astro.config.mjs`. Code samples carry no comments.
