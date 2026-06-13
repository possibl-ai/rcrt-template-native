import { AdvisorScreen } from '@possibl/rcrt-app-kit/native';

// The chat-first advisor (presented as a modal — see app/_layout.tsx). It
// self-provisions the advisor bundle, grounds every message with the current
// app-page/app-context, and can navigate the app via guide cards. No spotlight
// (web-only) — the native manifest flags it honestly.
export default function AdvisorRoute() {
  return <AdvisorScreen />;
}
