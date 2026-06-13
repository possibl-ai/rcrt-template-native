import { View } from 'react-native';
import { useCached } from '@possibl/rcrt-app-kit/core';
import { defineSection, defineAnchor, SectionPage, StatCard, Card, EmptyState, SkeletonPanel } from '@possibl/rcrt-app-kit/native';
import { glyph } from '../lib/icons';
import { getClient } from '../lib/api-client';
import { tenantId } from '../lib/env';
import { Item } from '../lib/schemas';

// A section is a DOMAIN COMPONENT slotted into the registry. The shell renders
// the header / pull-to-refresh / UpdatedAgo chrome (SectionPage cache=…); you
// write only the body with React Native primitives. Anchors keep their ids for
// advisor grounding (spotlight is web-only — the native anchor is a no-op wrapper).

const anchors = {
  kpis: defineAnchor({ label: 'KPI strip (item counts)' }),
  recent: defineAnchor({ label: 'Recent items list' }),
};

function HomeBody() {
  const items = useCached('home:items', () => Item.query(getClient().forTenant(tenantId)));
  const rows = items.data ?? [];
  const open = rows.filter((r) => r.content.status !== 'done').length;

  return (
    <SectionPage title="Home" subtitle="Workspace at a glance" cache={items}>
      <anchors.kpis.Anchor>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <StatCard label="Items" value={rows.length} />
          <StatCard label="Open" value={open} tone="accent" />
          <StatCard label="Done" value={rows.length - open} tone="success" />
        </View>
      </anchors.kpis.Anchor>

      <anchors.recent.Anchor>
        {items.data === undefined ? (
          <SkeletonPanel />
        ) : rows.length === 0 ? (
          <EmptyState title="Nothing here yet" hint="Add an item from the Items tab to see it here." />
        ) : (
          <View style={{ gap: 8 }}>
            {rows.slice(0, 5).map((r) => (
              <Card key={r.id}>{r.content.name}</Card>
            ))}
          </View>
        )}
      </anchors.recent.Anchor>
    </SectionPage>
  );
}

export const home = defineSection({
  id: 'home',
  path: '/home',
  label: 'Home',
  icon: glyph('⌂'),
  navSlot: 'top',
  description: 'Dashboard: item counts + the five most recent items.',
  component: HomeBody,
  anchors,
});
