import { defineSchema } from '@possibl/rcrt-app-kit/core';

// All persistence is interpret:* tagged breadcrumbs — there is no database.
// `defineSchema` (from kit /core, which is platform-agnostic) binds a tag +
// content type + schema_version into one typed handle (Item.query / .create /
// .patch / .upsertByName). This is byte-for-byte the SAME data layer the web
// template uses — `core` is shared verbatim across web and native.

export interface ItemContent extends Record<string, unknown> {
  name: string;
  status: 'open' | 'done';
  note?: string;
}

export const Item = defineSchema<ItemContent>({
  tag: 'interpret:item',
  version: 1,
});
