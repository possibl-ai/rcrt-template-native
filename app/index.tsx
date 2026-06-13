import { Redirect } from 'expo-router';

// Land on the first section's tab. (The first section in the registry is Home.)
export default function Index() {
  return <Redirect href="/home" />;
}
