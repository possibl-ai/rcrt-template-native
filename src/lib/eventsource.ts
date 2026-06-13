// React Native has no global EventSource. The SDK's chat stream takes an
// EventSource constructor through config (`useHeaderAuth: true`); we hand it
// react-native-sse here and thread it into <RcrtNativeProvider eventSource>.
import EventSource from 'react-native-sse';

export { EventSource };
