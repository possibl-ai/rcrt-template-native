import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signOut as firebaseSignOut, type Auth, type User } from 'firebase/auth';
import { firebaseConfig, firebaseEnabled } from './env';
import { setTokenRefreshCallback } from './api-client';

// Auth is the SEAM the kit leaves open (exactly like the web template): this
// module owns the IdP and feeds an access token to the SDK client. Two modes:
//   • key mode (default, dev/preview): no Firebase → authenticated immediately;
//     the workspace API key (EXPO_PUBLIC_RCRT_API_KEY) is the token.
//   • Firebase mode (production): the Firebase id token is the token, bound via
//     setTokenRefreshCallback. The native sign-in UX (Google via
//     expo-auth-session, Apple, email/password, …) is app-specific — wire it in
//     `signIn` below. The SoW's Firebase-auth requirement lives entirely here.

interface AuthUser {
  email: string | null;
  displayName: string | null;
}

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;

function getFirebaseAuth(): Auth {
  if (!firebaseAuth) {
    firebaseApp = initializeApp(firebaseConfig);
    // For production persistence across launches, swap getAuth() for
    // initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) }).
    firebaseAuth = getAuth(firebaseApp);
  }
  return firebaseAuth;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Key mode: nothing to sign into — authenticated immediately.
  const [isAuthenticated, setIsAuthenticated] = useState(!firebaseEnabled);
  const [isLoading, setIsLoading] = useState(firebaseEnabled);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    if (!firebaseEnabled) return;
    const auth = getFirebaseAuth();
    setTokenRefreshCallback(async () => (auth.currentUser ? auth.currentUser.getIdToken() : null));
    const unsub = onAuthStateChanged(auth, (u: User | null) => {
      setIsAuthenticated(Boolean(u));
      setUser(u ? { email: u.email, displayName: u.displayName } : null);
      setIsLoading(false);
    });
    return unsub;
  }, []);

  const signIn = useCallback(async () => {
    if (!firebaseEnabled) return;
    // Native Google sign-in needs a platform flow (e.g. expo-auth-session) +
    // signInWithCredential. Wire your chosen IdP flow here.
    throw new Error('Configure a native Firebase sign-in flow in src/lib/auth.tsx (e.g. expo-auth-session).');
  }, []);

  const signOut = useCallback(async () => {
    if (!firebaseEnabled) return;
    await firebaseSignOut(getFirebaseAuth());
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
