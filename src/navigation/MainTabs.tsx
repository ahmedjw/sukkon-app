import { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';
import {
  type LucideIcon,
  Headphones,
  Home,
  MessageCircle,
  Mic,
  Stethoscope,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import {
  CommunityScreen,
  HomeScreen,
  PodcastScreen,
  SessionsScreen,
  TherapistsScreen,
} from '@screens/index';
import { colors, font } from '@theme/tokens';
import type { BookingMode } from '@/services/api';

const Tab = createBottomTabNavigator();

const TAB_ICONS: Record<string, LucideIcon> = {
  Home,
  Therapists: Stethoscope,
  Sessions: Headphones,
  Community: MessageCircle,
  Podcast: Mic,
};

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const IconCmp = TAB_ICONS[name];
  return (
    <IconCmp
      size={22}
      color={focused ? colors.primary : colors.textLo}
      strokeWidth={focused ? 2.4 : 1.8}
    />
  );
}

type Props = {
  onOpenSettings: () => void;
  onStartBooking: (mode: BookingMode, therapistId: string) => void;
  onOpenTherapist: (therapistId: string) => void;
};

export function MainTabs({ onOpenSettings, onStartBooking, onOpenTherapist }: Props) {
  const { t } = useTranslation();
  const [pendingMode, setPendingMode] = useState<BookingMode | null>(null);

  const handleBookTherapist = (therapistId: string) => {
    const mode: BookingMode = pendingMode ?? 'scheduled';
    setPendingMode(null);
    onStartBooking(mode, therapistId);
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLo,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
      })}
    >
      <Tab.Screen name="Home" options={{ title: t('tabs.home') }}>
        {({ navigation }) => (
          <HomeScreen
            onOpenSettings={onOpenSettings}
            onStartBooking={(mode) => {
              setPendingMode(mode);
              navigation.navigate('Therapists' as never);
            }}
            onOpenTherapist={onOpenTherapist}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Therapists" options={{ title: t('tabs.therapists') }}>
        {() => (
          <TherapistsScreen
            onOpenTherapist={onOpenTherapist}
            onBookTherapist={handleBookTherapist}
            pendingMode={pendingMode}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Sessions" options={{ title: t('tabs.sessions') }}>
        {() => <SessionsScreen />}
      </Tab.Screen>
      <Tab.Screen name="Community" options={{ title: t('tabs.community') }}>
        {() => <CommunityScreen />}
      </Tab.Screen>
      <Tab.Screen name="Podcast" options={{ title: t('tabs.podcast') }}>
        {() => <PodcastScreen />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    height: 64,
    paddingTop: 6,
    paddingBottom: 8,
  },
  tabLabel: { fontSize: font.size.micro, fontWeight: font.weight.medium },
});
