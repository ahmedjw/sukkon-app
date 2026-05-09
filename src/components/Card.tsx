import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

import { colors, radius, space, shadow } from '@theme/tokens';

type Props = {
  children: ReactNode;
  style?: ViewStyle;
  padded?: boolean;
};

export function Card({ children, style, padded = true }: Props) {
  return <View style={[styles.card, padded && styles.padded, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    ...shadow.card,
  },
  padded: { padding: space[4] },
});
