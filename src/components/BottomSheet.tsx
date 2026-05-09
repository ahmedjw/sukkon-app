import { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, space, font } from '@theme/tokens';

type Props = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
};

export function BottomSheet({ visible, onClose, title, children }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        {title ? <Text style={styles.title}>{title}</Text> : null}
        <View style={styles.body}>{children}</View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.overlay },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: space[5],
    paddingTop: space[3],
    paddingBottom: space[6],
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    marginBottom: space[3],
  },
  title: {
    fontSize: font.size.h3,
    fontWeight: font.weight.bold,
    color: colors.textHi,
    marginBottom: space[3],
  },
  body: { gap: space[3] },
});
