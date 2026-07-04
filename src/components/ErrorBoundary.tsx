import { Component, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { ErrorState } from './ErrorState';

type Props = { children: ReactNode };
type State = { hasError: boolean };

// Class component: React error boundaries have no hook equivalent. The fallback
// avoids i18n on purpose — if the crash originated there, t() would crash again.
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    // Crash-reporting seam (Sentry etc.) goes here post-launch.
    console.error('[ErrorBoundary]', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <ErrorState
            message={'Something went wrong.\nحدث خطأ ما.'}
            onRetry={() => this.setState({ hasError: false })}
          />
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', backgroundColor: '#FFFFFF' },
});
