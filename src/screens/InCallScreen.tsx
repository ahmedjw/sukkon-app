import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Avatar } from '@components/index';
import { colors, font, radius, space } from '@theme/tokens';

type Props = {
  therapistName: string;
  durationMin: number;
  onEnd: () => void;
};

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function InCallScreen({ therapistName, durationMin, onEnd }: Props) {
  const { t } = useTranslation();
  const [elapsed, setElapsed] = useState(0);
  const [muted, setMuted] = useState(false);
  const [camOn, setCamOn] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const remainingMin = Math.max(0, durationMin - Math.floor(elapsed / 60));

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.stage}>
        <View style={styles.therapistVideo}>
          <Avatar name={therapistName} size={120} />
          <Text style={styles.therapistName}>{therapistName}</Text>
        </View>

        <View style={styles.selfTile}>
          {camOn ? (
            <Avatar name={t('incall.you')} size={36} />
          ) : (
            <Text style={styles.selfTileGlyph}>🚫</Text>
          )}
          <Text style={styles.selfTileLabel}>{t('incall.you')}</Text>
        </View>

        <View style={styles.statusBar}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>{t('incall.connected')}</Text>
          <Text style={styles.timer}>{formatElapsed(elapsed)}</Text>
          <Text style={styles.remaining}>{t('incall.remaining', { count: remainingMin })}</Text>
        </View>

        {chatOpen ? (
          <View style={styles.chatOverlay}>
            <Text style={styles.chatTitle}>{t('incall.chat')}</Text>
            <Text style={styles.chatPlaceholder}>{t('incall.chatPlaceholder')}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.controls}>
        <ControlButton
          glyph={muted ? '🔇' : '🎙️'}
          label={muted ? t('incall.unmute') : t('incall.mute')}
          active={muted}
          onPress={() => setMuted((v) => !v)}
        />
        <ControlButton
          glyph={camOn ? '📹' : '🚫'}
          label={camOn ? t('incall.camOff') : t('incall.camOn')}
          active={!camOn}
          onPress={() => setCamOn((v) => !v)}
        />
        <ControlButton
          glyph="💬"
          label={t('incall.chat')}
          active={chatOpen}
          onPress={() => setChatOpen((v) => !v)}
        />
        <Pressable style={styles.endButton} onPress={onEnd}>
          <Text style={styles.endGlyph}>📞</Text>
          <Text style={styles.endLabel}>{t('incall.end')}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function ControlButton({
  glyph,
  label,
  active,
  onPress,
}: {
  glyph: string;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.control, active && styles.controlActive]} onPress={onPress}>
      <Text style={styles.controlGlyph}>{glyph}</Text>
      <Text style={[styles.controlLabel, active && styles.controlLabelActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.navy },
  stage: { flex: 1, padding: space[4] },
  therapistVideo: {
    flex: 1,
    backgroundColor: '#152D52',
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[3],
  },
  therapistName: { color: colors.surface, fontSize: font.size.h3, fontWeight: font.weight.bold },
  selfTile: {
    position: 'absolute',
    top: space[5],
    right: space[5],
    width: 96,
    height: 128,
    backgroundColor: '#0B2241',
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  selfTileGlyph: { fontSize: 28 },
  selfTileLabel: { color: colors.surface, fontSize: font.size.micro, opacity: 0.85 },
  statusBar: {
    position: 'absolute',
    top: space[4],
    left: space[4],
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: space[3],
    paddingVertical: space[2],
    borderRadius: radius.pill,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  statusText: { color: colors.surface, fontSize: font.size.micro, fontWeight: font.weight.semibold },
  timer: { color: colors.surface, fontSize: font.size.caption, fontWeight: font.weight.bold },
  remaining: { color: colors.surface, opacity: 0.75, fontSize: font.size.micro },
  chatOverlay: {
    position: 'absolute',
    left: space[4],
    right: space[4],
    bottom: space[4],
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: space[4],
    borderRadius: radius.lg,
    gap: space[2],
  },
  chatTitle: { fontSize: font.size.body, color: colors.textHi, fontWeight: font.weight.bold },
  chatPlaceholder: { fontSize: font.size.caption, color: colors.textMd },
  controls: {
    flexDirection: 'row',
    gap: space[2],
    padding: space[4],
    backgroundColor: '#0B2241',
  },
  control: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radius.lg,
    paddingVertical: space[3],
    alignItems: 'center',
    gap: 4,
  },
  controlActive: { backgroundColor: colors.primary },
  controlGlyph: { fontSize: 22 },
  controlLabel: { color: colors.surface, opacity: 0.8, fontSize: font.size.micro },
  controlLabelActive: { opacity: 1, fontWeight: font.weight.bold },
  endButton: {
    flex: 1,
    backgroundColor: colors.danger,
    borderRadius: radius.lg,
    paddingVertical: space[3],
    alignItems: 'center',
    gap: 4,
  },
  endGlyph: { fontSize: 22 },
  endLabel: { color: colors.surface, fontSize: font.size.micro, fontWeight: font.weight.bold },
});
