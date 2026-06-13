import { Text } from 'react-native';
import { defineSection, SectionPage, Card, useTheme } from '@possibl/rcrt-app-kit/native';
import { glyph } from '../lib/icons';
import { tenantId } from '../lib/env';

function SettingsBody() {
  const t = useTheme();
  return (
    <SectionPage title="Settings" subtitle="App configuration">
      <Card>
        <Text style={{ color: t.mutedFg }}>
          Connected to workspace {tenantId || '(set EXPO_PUBLIC_RCRT_TENANT_ID)'}. Add your own
          integration settings here.
        </Text>
      </Card>
    </SectionPage>
  );
}

export const settings = defineSection({
  id: 'settings',
  path: '/settings',
  label: 'Settings',
  icon: glyph('⚙'),
  navSlot: 'bottom',
  description: 'App + workspace settings.',
  component: SettingsBody,
});
