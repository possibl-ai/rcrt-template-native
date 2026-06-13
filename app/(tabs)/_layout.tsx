import { RcrtTabs } from '@possibl/rcrt-app-kit/native';
import { app } from '../../src/app.config';

// The bottom-tab layout, DERIVED from the registry by the kit (one tab per
// non-hidden section). Adding a section = add its defineSection to the registry
// + a 3-line route file beside this one.
export default function TabsLayout() {
  return <RcrtTabs app={app} />;
}
