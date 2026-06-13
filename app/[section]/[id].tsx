import { useLocalSearchParams } from 'expo-router';
import { RecordScreen } from '@possibl/rcrt-app-kit/native';
import { app } from '../../src/app.config';

// Deep-linkable record route — /<section>/<id> → the section's record screen.
// Resolves the record key from the registry (the section's first declared
// record), so this single file serves every section's detail view.
export default function RecordRoute() {
  const { section, id } = useLocalSearchParams<{ section: string; id: string }>();
  const sec = app.sections.find((s) => s.id === section);
  const recordKey = sec ? Object.keys(sec.records)[0] : undefined;
  return (
    <RecordScreen
      app={app}
      sectionId={String(section)}
      recordKey={String(recordKey ?? '')}
      id={String(id)}
    />
  );
}
