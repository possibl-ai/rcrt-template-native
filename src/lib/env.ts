// Build-time config from EXPO_PUBLIC_* env (Expo inlines these into the JS
// bundle, the RN counterpart of Vite's VITE_*). API url + tenant are required;
// Firebase is optional — without its API key the app runs in "key mode" (the
// workspace API key is the auth token), which is the easy dev/preview path.

export const apiUrl: string = process.env.EXPO_PUBLIC_RCRT_API_URL ?? '';
export const tenantId: string = process.env.EXPO_PUBLIC_RCRT_TENANT_ID ?? '';
export const apiKey: string = process.env.EXPO_PUBLIC_RCRT_API_KEY ?? '';

export const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
};

/** When Firebase is configured the app requires Google sign-in; otherwise key mode. */
export const firebaseEnabled = Boolean(firebaseConfig.apiKey && firebaseConfig.authDomain);
