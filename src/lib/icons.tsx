import { Text } from 'react-native';

// Tiny glyph icons (no icon-library dependency). The registry's `icon` field is
// platform-agnostic in SHAPE — web sets a lucide-react component, native sets
// one of these. RcrtTabs renders it with { color, size }.
// Props include an (ignored) `className?` so the component is assignable to the
// registry's platform-agnostic `icon?: ComponentType<{ className?: string }>`,
// while RcrtTabs renders it with { color, size }.
export function glyph(symbol: string) {
  return function Glyph({ color, size = 22 }: { color?: string; size?: number; className?: string }) {
    return <Text style={{ color: color ?? '#fff', fontSize: size }}>{symbol}</Text>;
  };
}
