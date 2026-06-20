import { defineApp } from '@possibl/rcrt-app-kit/native';
import { home } from './sections/Home';
import { items } from './sections/Items';
import { settings } from './sections/Settings';

// ─────────────────────────────────────────────────────────────────────────────
// THE APP — a Section Registry. This is the SAME `defineApp`/`defineSection`
// config the WEB console template authors; only the import path
// (@possibl/rcrt-app-kit/native vs /shell) and the section BODIES (React Native
// View/Text vs DOM) differ. From this one declaration the kit's native shell
// derives Expo Router navigation (sections → tabs, the record route → a stack
// screen), the interpret:ui-manifest (platform: native, spotlight flagged
// web-only), the chat-first advisor, page-context grounding and SWR caching.
//
// To add a section: write a defineSection(...) in src/sections/, add it here,
// and add a 3-line tab route file in app/(tabs)/. (Expo Router is file-based, so
// each tab needs a route file delegating to <SectionScreen>; that file is pure
// scaffold — the app's surface still lives entirely in this registry.)
// ─────────────────────────────────────────────────────────────────────────────

export const app = defineApp({
  name: 'rcrt-native',
  version: '0.1.0',
  branding: { productName: 'RCRT Native', byline: 'on RCRT' },
  sections: [home, items, settings],
  advisor: {
    agent: 'advisor',
    displayName: 'Advisor',
    tagline: 'sees this app',
    // No renderChat → the kit's built-in NativeChat (text-first, RN). The
    // spotlight overlay is web-only; advisor navigation works on native.
    suggestions: ['What needs my attention?', 'Add an item for me', 'Mark everything done'],
    // App-control ACTIONS are serialised into interpret:ui-manifest so the
    // advisor knows what it may DO (not just navigate). Each maps to a workspace
    // tool; `approval: 'user'` means the human confirms before it runs. The tool
    // is implemented platform-side in the paired bundle — the app only DECLARES
    // the action surface so the manifest is complete (same on web + native).
    actions: [
      {
        name: 'create_item',
        tool: 'item-act',
        approval: 'user',
        description: 'Create a work item. Prefer prefilling the "items.new-item" form so the user confirms.',
      },
    ],
  },
});
