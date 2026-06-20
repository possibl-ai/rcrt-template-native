import { useEffect, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useCached } from '@possibl/rcrt-app-kit/core';
import { defineSection, defineAnchor, SectionPage, Card, Button, Badge, useTheme } from '@possibl/rcrt-app-kit/native';
import { glyph } from '../lib/icons';
import { getClient } from '../lib/api-client';
import { tenantId } from '../lib/env';
import { WorkspaceSettings, SETTINGS_NAME, type WorkspaceSettingsContent } from '../lib/schemas';
import { clearSampleItems } from '../lib/sample-data';

// Settings shows a SINGLETON breadcrumb pattern: one `interpret:app-settings`
// row per workspace, read with useCached + `.query()[0]`, written idempotently
// with `.upsertByName(SETTINGS_NAME, …)`. Still no database — preferences are a
// breadcrumb like everything else. (Same data layer as the web template.)

const anchors = {
  prefs: defineAnchor({ label: 'Workspace preferences form' }),
  data: defineAnchor({ label: 'Sample-data controls' }),
};

const DEFAULTS: WorkspaceSettingsContent = { displayName: '', defaultStatus: 'open' };

function SettingsBody() {
  const t = useTheme();
  const client = getClient().forTenant(tenantId);
  const settings = useCached('settings:singleton', async () => (await WorkspaceSettings.query(client))[0] ?? null);
  const [draft, setDraft] = useState<WorkspaceSettingsContent>(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settings.data) setDraft({ ...DEFAULTS, ...settings.data.content });
  }, [settings.data?.id]);

  const save = async () => {
    if (saving) return;
    setSaving(true);
    await WorkspaceSettings.upsertByName(client, {
      name: SETTINGS_NAME,
      title: 'Workspace settings',
      content: draft,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
    void settings.refresh();
  };

  const clearSamples = async () => {
    if (clearing) return;
    setClearing(true);
    await clearSampleItems(client);
    setClearing(false);
  };

  return (
    <SectionPage title="Settings" subtitle="App configuration" cache={settings}>
      <anchors.prefs.Anchor>
        <Card style={{ marginBottom: 12 }}>
          <View style={{ gap: 10 }}>
            <Text style={{ color: t.mutedFg, fontSize: 13 }}>Display name</Text>
            <TextInput
              style={{ color: t.fg, backgroundColor: t.input, borderRadius: t.radiusSm, padding: 10 }}
              placeholder="e.g. Acme Operations"
              placeholderTextColor={t.mutedFg}
              value={draft.displayName}
              onChangeText={(v) => setDraft((d) => ({ ...d, displayName: v }))}
            />
            <Text style={{ color: t.mutedFg, fontSize: 13 }}>Default status for new items</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {(['open', 'done'] as const).map((s) => {
                const on = draft.defaultStatus === s;
                return (
                  <Pressable
                    key={s}
                    onPress={() => setDraft((d) => ({ ...d, defaultStatus: s }))}
                    style={{
                      paddingVertical: 6,
                      paddingHorizontal: 14,
                      borderRadius: t.radiusSm,
                      backgroundColor: on ? t.accent + '22' : 'transparent',
                      borderWidth: 1,
                      borderColor: on ? t.accent : t.border,
                    }}
                  >
                    <Text style={{ color: on ? t.accent : t.mutedFg, fontWeight: on ? '700' : '500' }}>{s}</Text>
                  </Pressable>
                );
              })}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 }}>
              <Button onPress={() => void save()} loading={saving}>
                Save settings
              </Button>
              {saved && <Badge tone="success">Saved</Badge>}
            </View>
          </View>
        </Card>
      </anchors.prefs.Anchor>

      <anchors.data.Anchor>
        <Card>
          <Text style={{ color: t.mutedFg, marginBottom: 10 }}>
            Connected to workspace {tenantId || '(set EXPO_PUBLIC_RCRT_TENANT_ID)'}. Demo rows are tagged so
            you can remove them without touching real data.
          </Text>
          <Button variant="outline" size="sm" onPress={() => void clearSamples()} loading={clearing}>
            Clear sample data
          </Button>
        </Card>
      </anchors.data.Anchor>
    </SectionPage>
  );
}

export const settings = defineSection({
  id: 'settings',
  path: '/settings',
  label: 'Settings',
  icon: glyph('⚙'),
  navSlot: 'bottom',
  description: 'App + workspace settings (persisted as a singleton breadcrumb), plus sample-data controls.',
  component: SettingsBody,
  anchors,
});
