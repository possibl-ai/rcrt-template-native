import { SectionScreen } from '@possibl/rcrt-app-kit/native';
import { app } from '../../src/app.config';

export default function ItemsRoute() {
  return <SectionScreen app={app} sectionId="items" />;
}
