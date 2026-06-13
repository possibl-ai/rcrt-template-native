import { SectionScreen } from '@possibl/rcrt-app-kit/native';
import { app } from '../../src/app.config';

export default function SettingsRoute() {
  return <SectionScreen app={app} sectionId="settings" />;
}
