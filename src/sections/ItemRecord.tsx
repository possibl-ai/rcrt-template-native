import { ScrollView, Text, View } from 'react-native';
import { useCached } from '@possibl/rcrt-app-kit/core';
import {
  defineAnchor,
  useTheme,
  Card,
  Badge,
  Button,
  EmptyState,
  SkeletonPanel,
  type RecordComponentProps,
} from '@possibl/rcrt-app-kit/native';
import { getClient } from '../lib/api-client';
import { tenantId } from '../lib/env';
import { Item } from '../lib/schemas';

// A RECORD ROUTE component — an Expo Router stack screen the shell pushes for
// /items/:id. `close()` pops the stack. Declared as the section's records.item;
// the shell projects it into the ui-manifest and grounds the advisor with the
// resolved item name (see the section's async `context`).

const recordAnchors = { header: defineAnchor({ label: 'Item record header' }) };

export function ItemRecord({ params, close }: RecordComponentProps) {
  const t = useTheme();
  const detail = useCached(`item:${params.id}`, async () => {
    const rows = await Item.query(getClient().forTenant(tenantId), { limit: 200 });
    return rows.find((r) => r.id === params.id) ?? null;
  });
  const item = detail.data?.content;

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <recordAnchors.header.Anchor>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 12,
            borderBottomColor: t.border,
            borderBottomWidth: 1,
          }}
        >
          <Button variant="ghost" size="sm" onPress={close}>
            ← Items
          </Button>
          {item && <Badge tone={item.status === 'done' ? 'success' : 'accent'}>{item.status}</Badge>}
        </View>
      </recordAnchors.header.Anchor>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {detail.data === undefined ? (
          <SkeletonPanel />
        ) : !item ? (
          <EmptyState
            title="Item not found"
            hint="It may have been removed, or the link is stale."
            action={
              <Button size="sm" onPress={close}>
                Back to items
              </Button>
            }
          />
        ) : (
          <Card>
            <Text style={{ color: t.fg, fontSize: 18, fontWeight: '700', marginBottom: 6 }}>{item.name}</Text>
            {item.note && <Text style={{ color: t.mutedFg }}>{item.note}</Text>}
          </Card>
        )}
      </ScrollView>
    </View>
  );
}
