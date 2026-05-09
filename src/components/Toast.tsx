import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, space, font, shadow } from '@theme/tokens';

type Variant = 'info' | 'success' | 'error';
type ToastItem = { id: number; message: string; variant: Variant };
type ToastContextValue = { show: (message: string, variant?: Variant) => void };

const ToastContext = createContext<ToastContextValue>({ show: () => undefined });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastItem | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  const show = useCallback(
    (message: string, variant: Variant = 'info') => {
      setToast({ id: Date.now(), message, variant });
    },
    [],
  );

  useEffect(() => {
    if (!toast) return;
    Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    const t = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(() =>
        setToast(null),
      );
    }, 2500);
    return () => clearTimeout(t);
  }, [toast, opacity]);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {toast ? (
        <Animated.View
          pointerEvents="none"
          style={[styles.toast, { opacity, top: insets.top + space[3] }, variantStyle[toast.variant]]}
        >
          <Text style={styles.text}>{toast.message}</Text>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: space[4],
    right: space[4],
    paddingVertical: space[3],
    paddingHorizontal: space[4],
    borderRadius: radius.md,
    ...shadow.floating,
  },
  text: { color: colors.surface, fontSize: font.size.body, fontWeight: font.weight.medium },
});

const variantStyle: Record<Variant, ViewStyle> = {
  info: { backgroundColor: colors.navy },
  success: { backgroundColor: colors.primaryDk },
  error: { backgroundColor: colors.danger },
};
