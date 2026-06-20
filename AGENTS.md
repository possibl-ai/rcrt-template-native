# AGENTS.md — building on rcrt-template-native

You are extending a **kit-based RCRT native app** (React Native + Expo Router +
EAS). You author the **same Section Registry** the web console template uses —
only the import path (`@possibl/rcrt-app-kit/native` vs `/shell`) and the section
**bodies** (RN `View`/`Text` vs DOM) differ. The kit derives Expo Router
navigation, the `interpret:ui-manifest`, the chat-first advisor, page-context
grounding and SWR caching from that one declaration.

## File map — TOUCH / CONFIG / LEAVE

```
src/
  app.config.tsx     CONFIG  the whole app surface: defineApp({ sections, advisor, branding })
  sections/          TOUCH   one file per section = an RN domain component + its anchors/forms
    Home.tsx                 dashboard (stat cards + empty state w/ sample-data CTA)
    Items.tsx                collection: tabs + a prefillable form + a record route
    ItemRecord.tsx           record-route body (/items/:id, a stack screen)
    Settings.tsx             persisted SINGLETON settings (upsertByName) + sample-data controls
  lib/
    schemas.ts       CONFIG  defineSchema handles (breadcrumb shapes) — NO database (SAME as web)
    sample-data.ts   CONFIG  copyable seed/clear pattern (so a new app looks alive)
    api-client.ts    LEAVE   the one @possibl/rcrt-sdk client (auth seam)
    auth.tsx         LEAVE   Firebase / API-key TokenProvider
    env.ts           LEAVE   EXPO_PUBLIC_* config
    eventsource.ts   LEAVE   react-native-sse EventSource for the advisor stream
    icons.tsx        CONFIG  glyph icons for the tab bar
app/                 LEAVE   Expo Router scaffold — thin, delegates to the kit
  _layout.tsx              <RcrtNativeProvider theme=…> + <Stack> + <AdvisorFab>  (brand tokens live here)
  (tabs)/_layout.tsx       <RcrtTabs app> — bottom tabs derived from the registry
  (tabs)/{home,items,settings}.tsx   3-line <SectionScreen app sectionId=…>
  [section]/[id].tsx       <RecordScreen> — deep-linkable record routes
  advisor.tsx              <AdvisorScreen> — chat-first advisor (modal)
app.json, eas.json, metro.config.js, babel.config.js, .env   LEAVE  scaffold
vendor/*.tgz         LEAVE   the @possibl/* tarballs (file: deps until published)
```

## ALWAYS

- Import from `@possibl/rcrt-app-kit/native` + `@possibl/rcrt-app-kit/core`. They
  ARE installed (vendored tarballs).
- Use **React Native** components (`View`/`Text`/`Pressable`/`ScrollView`/
  `TextInput`), never HTML elements.
- Persist with `defineSchema` handles against `getClient().forTenant(tenantId)`.
  The tag IS the table.
- Render every body inside `<SectionPage cache={useCached(...)}>` for the
  header/pull-to-refresh/UpdatedAgo/error chrome.
- Reference anchors as components (`anchors.x.Anchor`) — they keep their id/label
  for advisor grounding even though native emits no DOM target.
- Brand by editing the `theme` tokens passed to `<RcrtNativeProvider>` in
  `app/_layout.tsx` (the RN counterpart of the web `--rcrt-*` CSS vars). Token
  edits only — never fork a kit primitive.
- Make empty + loading states excellent (`SkeletonPanel` + `EmptyState` with a
  "Load sample data" CTA).

## NEVER

- Never hand-roll a shell, navigator, `interpret:ui-manifest`, advisor,
  page-context effects or SWR — inherit them from the kit.
- Never add a database, REST layer, or custom auth. Persistence is breadcrumbs;
  auth is the seam in `src/lib/auth.tsx`.
- Never claim the advisor **spotlight** works on native — it is **web-only**. The
  native manifest sets `capabilities.spotlight = false`. Advisor-driven
  **navigation** (route push) DOES work.
- Never delete `vendor/` or flip the `@possibl/*` deps to npm semver — not yet
  published.

## Add a section (the whole recipe)

1. Create `src/sections/MySection.tsx` with an RN body (see Home/Items).
2. Add `mySection` to `sections` in `src/app.config.tsx`.
3. Add a 3-line tab route file `app/(tabs)/mine.tsx`:

```tsx
import { SectionScreen } from '@possibl/rcrt-app-kit/native';
import { app } from '../../src/app.config';
export default function MineRoute() { return <SectionScreen app={app} sectionId="mine" />; }
```

That route file is the ONLY native-specific extra vs web (Expo Router is
file-based) — pure scaffold. The tab, manifest entry, advisor grounding and page
chrome appear automatically. If a section declares `tabs`, `SectionScreen`
renders the segmented control for you — the body just reads `{ tab }` and filters
(don't render your own tab bar).

## Sample data (make the app look alive — and pass evals)

`src/lib/sample-data.ts` is the copyable pattern (identical to web): create
`interpret:item` rows stamped with `SAMPLE_TAG` (`sample:seed`), idempotently,
reached from an empty-state "Load sample data" button — never auto-seeded on
boot. Add a matching `seed*`/`clear*` pair for every new collection.

## interpret:ui-manifest (App Control) — how it publishes

`<RcrtNativeProvider>` publishes the manifest on boot via
`ensureManifestPublished(client, tenantId, app, { platform: 'native' })` →
hash-idempotently to **`client.forTenant(EXPO_PUBLIC_RCRT_TENANT_ID)`** (the
workspace tenant). It's client-side + lazy: it happens when the app actually runs
with a valid tenant + working auth. Declared `sections`/`anchors`/`forms`/
`advisor.actions` ARE the manifest — change the registry, never hand-write one.

## Verify locally

- `npm run type-check` (`tsc --noEmit`) MUST pass.
- `npx expo export` proves it bundles for a device (no device needed).
- Do NOT claim an EAS / App Store build — that needs Apple/Google credentials a
  template can't include.
