// Expo Metro config. We enable Metro's package-`exports` resolution so the
// subpath imports `@possibl/rcrt-app-kit/native` and `/core` resolve to the
// package's compiled `dist/*` (the kit ships subpath exports). Without this,
// Metro's legacy resolver can't find the subpaths.
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
