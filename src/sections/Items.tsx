import { useEffect, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useCached } from '@possibl/rcrt-app-kit/core';
import {
  defineSection,
  defineAnchor,
  defineForm,
  SectionPage,
  useAppForm,
  useTheme,
  Card,
  Badge,
  Button,
  EmptyState,
  SkeletonPanel,
} from '@possibl/rcrt-app-kit/native';
import { glyph } from '../lib/icons';
import { getClient } from '../lib/api-client';
import { tenantId } from '../lib/env';
import { Item, type ItemContent } from '../lib/schemas';
import { ItemRecord } from './ItemRecord';

const anchors = {
  list: defineAnchor({ label: 'Items list' }),
  newItem: defineAnchor({ label: 'New item button' }),
};

// A prefillable form. intent/entity/distinguishFrom are STRUCTURED manifest
// fields (not prose) so the advisor can prefill it precisely; the shell
// validates the prefill against `fields`. Same contract as on web.
const newItem = defineForm({
  title: 'New item',
  intent: 'Create a work item in this workspace. The advisor may prefill the name/note; the user submits.',
  entity: 'item',
  fields: {
    name: { required: true, description: 'Short item title' },
    note: { description: 'Optional detail' },
  },
});

function ItemsBody() {
  const t = useTheme();
  const router = useRouter();
  const items = useCached('items:all', () => Item.query(getClient().forTenant(tenantId)));
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<{ name: string; note: string }>({ name: '', note: '' });
  const [saving, setSaving] = useState(false);

  // Consume advisor form prefills: when the advisor opens "items.new-item" with
  // researched values, the shell hands them here (validated to the fields).
  const prefill = useAppForm(newItem);
  useEffect(() => {
    if (prefill.requested) {
      setDraft({ name: prefill.prefill.name ?? '', note: prefill.prefill.note ?? '' });
      setOpen(true);
      prefill.clear();
    }
  }, [prefill]);

  const save = async () => {
    if (!draft.name.trim() || saving) return;
    setSaving(true);
    const content: ItemContent = {
      name: draft.name.trim(),
      status: 'open',
      ...(draft.note.trim() ? { note: draft.note.trim() } : {}),
    };
    await Item.create(getClient().forTenant(tenantId), {
      name: `item:${draft.name.trim()}`,
      title: draft.name.trim(),
      content,
    });
    setSaving(false);
    setOpen(false);
    setDraft({ name: '', note: '' });
    void items.refresh();
  };

  return (
    <SectionPage
      title="Items"
      subtitle="Workspace items"
      cache={items}
      actions={
        <anchors.newItem.Anchor>
          <Button size="sm" onPress={() => setOpen((o) => !o)}>
            {open ? 'Close' : 'New'}
          </Button>
        </anchors.newItem.Anchor>
      }
    >
      {open && (
        <Card>
          <View style={{ gap: 8 }}>
            <TextInput
              style={{ color: t.fg, backgroundColor: t.input, borderRadius: t.radiusSm, padding: 10 }}
              placeholder="Name"
              placeholderTextColor={t.mutedFg}
              value={draft.name}
              onChangeText={(v) => setDraft((d) => ({ ...d, name: v }))}
            />
            <TextInput
              style={{ color: t.fg, backgroundColor: t.input, borderRadius: t.radiusSm, padding: 10 }}
              placeholder="Note (optional)"
              placeholderTextColor={t.mutedFg}
              value={draft.note}
              onChangeText={(v) => setDraft((d) => ({ ...d, note: v }))}
            />
            <Button onPress={() => void save()} loading={saving} disabled={!draft.name.trim()}>
              Create
            </Button>
          </View>
        </Card>
      )}

      <anchors.list.Anchor>
        {items.data === undefined ? (
          <SkeletonPanel />
        ) : items.data.length === 0 ? (
          <EmptyState title="No items" hint="Create your first item." />
        ) : (
          <View style={{ gap: 8 }}>
            {items.data.map((r) => (
              <Pressable key={r.id} onPress={() => router.push(`/items/${r.id}`)}>
                <Card>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ color: t.fg, fontSize: 15 }}>{r.content.name}</Text>
                    <Badge tone={r.content.status === 'done' ? 'success' : 'accent'}>{r.content.status}</Badge>
                  </View>
                </Card>
              </Pressable>
            ))}
          </View>
        )}
      </anchors.list.Anchor>
    </SectionPage>
  );
}

export const items = defineSection({
  id: 'items',
  path: '/items',
  label: 'Items',
  icon: glyph('☷'),
  navGroup: 'Workspace',
  description: 'Collection of workspace items. Tap a row for the full record.',
  component: ItemsBody,
  anchors,
  forms: { 'new-item': newItem },
  // A nested, deep-linkable record route — /items/:id (an Expo Router stack screen).
  records: {
    item: {
      path: ':id',
      label: 'Item record',
      description: 'Full-screen item record. Deep-linkable by breadcrumb id.',
      component: ItemRecord,
      // Async page context: the URL only has the id; resolve the NAME so the
      // advisor is grounded with "item:Onboarding", not "item:<uuid>".
      context: async ({ params }) => {
        const rows = await Item.query(getClient().forTenant(tenantId), { limit: 200 });
        const match = rows.find((r) => r.id === params.id);
        return `item:${match?.content.name ?? params.id}`;
      },
    },
  },
});
