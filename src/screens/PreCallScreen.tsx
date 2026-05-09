import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Avatar, Button, Card } from '@components/index';
import { colors, font, radius, space } from '@theme/tokens';

type Props = {
  therapistName: string;
  onBack: () => void;
  onJoin: () => void;
};

export function PreCallScreen({ therapistName, onBack, onJoin }: Props) {
  const { t } = useTranslation();
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.headerRow}>
        <Pressable onPress={onBack} hitSlop={8}>
          <Text style={styles.back}>← {t('common.back')}</Text>
        </Pressable>
        <Text style={styles.title}>{t('precall.title')}</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.preview}>
        <View style={styles.cam}>
          {camOn ? (
            <View style={styles.camInner}>
              <Avatar name="You" size={88} />
              <Text style={styles.camLabel}>{t('precall.cameraReady')}</Text>
            </View>
          ) : (
            <View style={styles.camOff}>
              <Text style={styles.camOffGlyph}>📷</Text>
              <Text style={styles.camOffLabel}>{t('precall.cameraOff')}</Text>
            </View>
          )}
        </View>

        <Card>
          <Text style={styles.therapistTo}>{t('precall.connectingTo')}</Text>
          <Text style={styles.therapistName}>{therapistName}</Text>
        </Card>

        <View style={styles.controlsRow}>
          <Pressable
            style={[styles.control, !micOn && styles.controlOff]}
            onPress={() => setMicOn((v) => !v)}
          >
            <Text style={[styles.controlGlyph, !micOn && styles.controlGlyphOff]}>
              {micOn ? '🎙️' : '🔇'}
            </Text>
            <Text style={[styles.controlLabel, !micOn && styles.controlLabelOff]}>
              {micOn ? t('precall.micOn') : t('precall.micOff')}
            </Text>
          </Pressable>
          <Pressable
            style={[styles.control, !camOn && styles.controlOff]}
            onPress={() => setCamOn((v) => !v)}
          >
            <Text style={[styles.controlGlyph, !camOn && styles.controlGlyphOff]}>
              {camOn ? '📹' : '🚫'}
            </Text>
            <Text style={[styles.controlLabel, !camOn && styles.controlLabelOff]}>
              {camOn ? t('precall.camOn') : t('precall.camOff')}
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.footer}>
        <Button title={t('precall.joinNow')} fullWidth size="lg" onPress={onJoin} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceAlt },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space[4],
    paddingVertical: space[3],
  },
  back: { color: colors.primary, fontSize: font.size.body, fontWeight: font.weight.semibold },
  title: { fontSize: font.size.h3, color: colors.textHi, fontWeight: font.weight.bold },
  preview: { flex: 1, padding: space[4], gap: space[4] },
  cam: {
    backgroundColor: colors.navy,
    borderRadius: radius.xl,
    height: 320,
    alignItems: 'center',
    justifyContent: 'center',
  },
  camInner: { alignItems: 'center', gap: space[3] },
  camLabel: { color: colors.surface, fontSize: font.size.caption, opacity: 0.85 },
  camOff: { alignItems: 'center', gap: space[2] },
  camOffGlyph: { fontSize: 48 },
  camOffLabel: { color: colors.surface, opacity: 0.8 },
  therapistTo: { fontSize: font.size.caption, color: colors.textMd },
  therapistName: { fontSize: font.size.h3, color: colors.textHi, fontWeight: font.weight.bold, marginTop: 2 },
  controlsRow: { flexDirection: 'row', gap: space[3] },
  control: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: space[4],
    alignItems: 'center',
    gap: space[1],
    borderWidth: 1,
    borderColor: colors.border,
  },
  controlOff: { backgroundColor: colors.surfaceAlt, borderColor: colors.danger },
  controlGlyph: { fontSize: 28 },
  controlGlyphOff: {},
  controlLabel: { fontSize: font.size.caption, color: colors.textHi, fontWeight: font.weight.semibold },
  controlLabelOff: { color: colors.danger },
  footer: {
    padding: space[4],
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
