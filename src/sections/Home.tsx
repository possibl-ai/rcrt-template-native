import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useCached } from '@possibl/rcrt-app-kit/core';
import { defineSection, defineAnchor, SectionPage, StatCard, Card, Button, EmptyState, SkeletonPanel } from '@possibl/rcrt-app-kit/native';
import { glyph } from '../lib/icons';
import { getClient } from '../lib/api-client';
import { tenantId } from '../lib/env';
import { Item } from '../lib/schemas';
import { seedSampleItems } from '../lib/sample-data';

// A section is a DOMAIN COMPONENT slotted into the registry. The shell renders
// the header / pull-to-refresh / UpdatedAgo chrome (SectionPage cache=…); you
// write only the body with React Native primitives. Anchors keep their ids for
// advisor grounding (spotlight is web-only — the native anchor is a no-op wrapper).

const anchors = {
  kpis: defineAnchor({ label: 'KPI strip (item counts)' }),
  recent: defineAnchor({ label: 'Recent items list' }),
};

function HomeBody() {
  const router = useRouter();
  const items = useCached('home:items', () => Item.query(getClient().forTenant(tenantId)));
  const [seeding, setSeeding] = useState(false);
  const rows = items.data ?? [];
  const open = rows.filter((r) => r.content.status !== 'done').length;
  const done = rows.length - open;
  const pct = rows.length ? Math.round((done / rows.length) * 100) : 0;

  const seed = async () => {
    if (seeding) return;
    setSeeding(true);
    await seedSampleItems();
    setSeeding(false);
    void items.refresh();
  };

  return (
    <SectionPage title="Home" subtitle="Workspace at a glance" cache={items}>
      <anchors.kpis.Anchor>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <StatCard label="Items" value={rows.length} />
          <StatCard label="Open" value={open} tone="accent" />
          <StatCard label="Done" value={done} tone="success" />
          <StatCard label="Complete" value={`${pct}%`} tone={pct === 100 ? 'success' : 'default'} />
        </View>
      </anchors.kpis.Anchor>

      <anchors.recent.Anchor>
        {items.data === undefined ? (
          <SkeletonPanel />
        ) : rows.length === 0 ? (
          <EmptyState
            title="Your workspace is ready"
            hint="Seed a few sample items to see the dashboard and advisor come alive — or jump to Items to create your own."
            action={
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Button size="sm" onPress={() => void seed()} loading={seeding}>
                  Load sample data
                </Button>
                <Button size="sm" variant="outline" onPress={() => router.push('/items')}>
                  Go to Items
                </Button>
              </View>
            }
          />
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
  description: 'Dashboard: item counts, completion rate + the five most recent items.',
  component: HomeBody,
  anchors,
});
