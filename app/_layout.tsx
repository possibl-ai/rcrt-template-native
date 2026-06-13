import { View, Text } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RcrtNativeProvider, AdvisorFab, asyncStorageAdapter, useTheme } from '@possibl/rcrt-app-kit/native';
import { app } from '../src/app.config';
import { getClient } from '../src/lib/api-client';
import { tenantId } from '../src/lib/env';
import { EventSource } from '../src/lib/eventsource';
import { AuthProvider, useAuth } from '../src/lib/auth';

// AsyncStorage-backed SWR snapshot store (the kit's sync-over-AsyncStorage
// adapter). Created once at module scope.
const storage = asyncStorageAdapter(AsyncStorage);

function Loading({ label }: { label: string }) {
  const t = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: t.bg, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: t.mutedFg }}>{label}</Text>
    </View>
  );
}

function Shell() {
  const { isAuthenticated, isLoading } = useAuth();

  // The kit owns the navigation, tabs, advisor and everything inside — the
  // root layout only decides "signed in?" and supplies the SDK client + storage.
  return (
    <RcrtNativeProvider
      app={app}
      client={getClient()}
      tenantId={tenantId}
      storage={storage}
      eventSource={EventSource}
    >
      <StatusBar style="light" />
      <View style={{ flex: 1 }}>
        {isLoading ? (
          <Loading label="Loading…" />
        ) : !isAuthenticated ? (
          <Loading label="Sign in required — wire your IdP flow in src/lib/auth.tsx." />
        ) : (
          <>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="advisor" options={{ presentation: 'modal', headerShown: true, title: 'Advisor' }} />
            </Stack>
            {/* The inherited advisor — reachable from every screen (native echo of the web dock). */}
            <AdvisorFab />
          </>
        )}
      </View>
    </RcrtNativeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
