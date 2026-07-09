# rcrt-template-native

A **React Native (Expo + EAS)** RCRT app template. It is authored as the **same
`defineApp` / `defineSection` Section Registry** the web
[`rcrt-template-console`](https://github.com/possibl-ai/rcrt-template-console)
uses — proving the RCRT app kit's registry is platform-agnostic. The
`@possibl/rcrt-app-kit/native` shell interprets that registry with Expo Router +
React Native instead of react-router-dom + the DOM.

> To be pushed to **`possibl-ai/rcrt-template-native`** as a GitHub template
> repo. (It supersedes the older `mobile-rn` seed's RN-Web approach with a true
> kit-based native app — see "Relationship to the old mobile-rn template".)

## The pure-config story on native

```
src/app.config.tsx       the Section Registry — the whole app surface
src/sections/*.tsx        one file per section: a domain component + its anchors/forms
  Home.tsx                  dashboard (stat cards + a delightful empty state w/ sample-data CTA)
  Items.tsx                 collection with tabs + a prefillable form + a record route
  ItemRecord.tsx            record-route body (/items/:id, a stack screen)
  Settings.tsx              persisted SINGLETON settings (upsertByName) + sample-data controls
src/lib/schemas.ts        defineSchema handles (breadcrumb shapes) — NO database
src/lib/sample-data.ts    copyable seed/clear pattern (so a new app looks alive on first load)
src/lib/{api-client,auth,env,eventsource}.ts   the SDK client + Firebase TokenProvider seam
AGENTS.md                 builder-facing guide (TOUCH/CONFIG/LEAVE, ALWAYS/NEVER, recipes)
app/                      Expo Router scaffold (thin, mechanical — delegates to the kit)
  _layout.tsx               <RcrtNativeProvider theme=…> + <Stack> + <AdvisorFab>  (brand tokens live here)
  (tabs)/_layout.tsx        <RcrtTabs app> — bottom tabs derived from the registry
  (tabs)/{home,items,settings}.tsx   3-line <SectionScreen app sectionId=…>
  [section]/[id].tsx        <RecordScreen> — deep-linkable record routes
  advisor.tsx               <AdvisorScreen> — the chat-first advisor (modal)
```

This template demonstrates: a dashboard, a collection with **tabs** (the kit's
`SectionScreen` renders the segmented control from the registry's abstract
`tabs`), a prefillable **form**, a deep-linkable **record route**, a persisted
**singleton settings** form (`upsertByName`), advisor **actions** in the
manifest, a **sample-data** seeding pattern, and brand tokens threaded through
`<RcrtNativeProvider theme=…>` so web + native feel like one product.

The kit derives Expo Router navigation, the `interpret:ui-manifest`, the advisor
(chat + grounding + self-provisioning), page-context and SWR caching from the
registry. You never hand-write a shell, navigator, manifest or cache.

## What's shared with the web template vs. what differs (honest)

**Shared verbatim:** the registry (`defineSection`/`defineApp`/`defineForm`),
the breadcrumb data layer (`@possibl/rcrt-app-kit/core`: `useCached`,
`defineSchema`, tenant fan-out), the `interpret:ui-manifest` projection, the
form `intent`/`entity`/`distinguishFrom` semantics, page-context grounding and
the advisor's grounding-tag + self-provisioning contract.

**RN-specific divergences:**

- **Spotlight is web-only.** The advisor's guide-overlay measures DOM anchors;
  there's no native equivalent, so the kit does **not** fake it. The native
  `ui-manifest` sets `capabilities.spotlight = false`. **Advisor-driven
  navigation (route push) works on native** via Expo Router.
- **Navigation:** sections → bottom **tabs**; record routes → **stack** screens
  (deep-linkable, e.g. `/items/<id>`); the advisor → a chat-first **modal**.
  A phone tab bar is flat, so `navGroup` doesn't apply; `navSlot: top|bottom`
  still orders the tabs (Home leads, Settings trails). Each tab needs a 3-line
  route file (Expo Router is file-based) — pure scaffold, not app surface.
- **Section bodies render `View`/`Text`, not DOM** — the kit ships native
  `Card`/`Badge`/`Button`/`SectionPage`/… with the same names + prop shapes, so
  a body reads the same on both platforms, but it's platform-specific code.
- **Storage:** AsyncStorage behind the kit's sync `StorageAdapter`.

## Sample data + App Control (same contracts as web)

- **Sample data:** `src/lib/sample-data.ts` seeds a handful of `interpret:item`
  breadcrumbs tagged `sample:seed` (idempotent), reached from an empty-state
  "Load sample data" button — never auto-seeded. `clearSampleItems` removes only
  the marked rows. Copy this for every new collection so the app and the advisor
  have real data from the first render.
- **`interpret:ui-manifest`:** `<RcrtNativeProvider>` publishes it on boot
  (`{ platform: 'native' }`) hash-idempotently to
  `client.forTenant(EXPO_PUBLIC_RCRT_TENANT_ID)` — the workspace tenant. It is
  derived from the registry (routes + anchors + forms + `advisor.actions`), so
  change the registry, never hand-write a manifest. Publication is client-side +
  lazy: it happens when the app actually runs with a valid tenant + auth.

## Setup

```bash
npm install                      # installs the vendored @possibl/* tarballs + Expo
cp .env.example .env             # fill EXPO_PUBLIC_RCRT_API_URL + _TENANT_ID (+ _API_KEY for key mode)
npm run start                    # Expo dev server (open in Expo Go / a dev build)
```

### Dependencies (vendored tarballs → registry flip)

`@possibl/rcrt-sdk` and `@possibl/rcrt-app-kit` are installed from
`vendor/*.tgz` (`file:` deps) until they're published to npm. Once published,
**flip `package.json` to registry ranges** (e.g.
`"@possibl/rcrt-app-kit": "^0.4.0"`, `"@possibl/rcrt-sdk": "^0.5.0"`) and delete
`vendor/`.

## Auth (the seam)

`src/lib/auth.tsx` owns the IdP and feeds a token to the SDK client. Default is
**key mode** (the `EXPO_PUBLIC_RCRT_API_KEY` workspace key is the token — the
easy dev/preview path). Set the `EXPO_PUBLIC_FIREBASE_*` vars to require
**Firebase** auth; the Firebase id token then becomes the token. The SoW's
Firebase-auth requirement lives entirely in this one file. Native Google/Apple
sign-in UX (e.g. via `expo-auth-session`) is wired in `signIn` — left as a seam.

## Build pipeline (Expo / EAS)

The SoW commits Possibl to React Native via **Expo + EAS**. This template ships
`app.json` + `eas.json` for that pipeline:

```bash
npx expo export                  # bundle-verify (no device needed) — proves it bundles
eas build:configure              # one-time: create the EAS project + credentials
eas build -p ios --profile preview   # a real cloud build (needs `eas login` + Apple/Google creds)
```

**What's verified in this repo vs. what needs you:** `tsc --noEmit` and
`npx expo export` are run to prove the app type-checks and bundles. A full **EAS
build / App Store / device run needs cloud credentials** (Apple/Google) that a
template can't include — run those yourself with `eas build`.

## Relationship to the old `mobile-rn` template

The previous `rcrt-template-mobile-rn` was **React Native Web** (RN compiled to
the web, deployed to Cloud Run, react-navigation, a hand-rolled `src/lib/rcrt.ts`
client). This template is the kit-based successor: a true native Expo/EAS app on
`@possibl/rcrt-app-kit/native`, authored as pure config. The old seed still
exists (it's not deleted); its registry entry now points here.

## Licence

MIT.
