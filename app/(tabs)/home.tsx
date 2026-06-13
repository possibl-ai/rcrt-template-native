import { SectionScreen } from '@possibl/rcrt-app-kit/native';
import { app } from '../../src/app.config';

// Pure scaffold: delegate to the kit's SectionScreen, which interprets the
// "home" section from the registry (header chrome, page-context, tabs).
export default function HomeRoute() {
  return <SectionScreen app={app} sectionId="home" />;
}
