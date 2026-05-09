import { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';

import { useAuth } from '@/auth';
import {
  BookingScreen,
  InCallScreen,
  PostCallScreen,
  PreCallScreen,
  SettingsScreen,
  TherapistDetailScreen,
  type BookingMode,
} from '@screens/index';
import { SplashScreen } from '@screens/auth/index';
import type { Booking } from '@/services/api';

import { AuthStack } from './AuthStack';
import { MainTabs } from './MainTabs';

type RootView =
  | { kind: 'main' }
  | { kind: 'settings' }
  | { kind: 'therapistDetail'; therapistId: string }
  | { kind: 'booking'; mode: BookingMode; therapistId: string }
  | { kind: 'precall'; booking: Booking }
  | { kind: 'incall'; booking: Booking }
  | { kind: 'postcall'; booking: Booking };

export function RootNavigator() {
  const { user } = useAuth();
  const [splashDone, setSplashDone] = useState(false);
  const [view, setView] = useState<RootView>({ kind: 'main' });

  if (!splashDone) {
    return (
      <NavigationContainer>
        <SplashScreen onDone={() => setSplashDone(true)} />
      </NavigationContainer>
    );
  }

  if (!user) {
    return (
      <NavigationContainer>
        <AuthStack />
      </NavigationContainer>
    );
  }

  const goMain = () => setView({ kind: 'main' });

  return (
    <NavigationContainer>
      {view.kind === 'main' && (
        <MainTabs
          onOpenSettings={() => setView({ kind: 'settings' })}
          onStartBooking={(mode, therapistId) => setView({ kind: 'booking', mode, therapistId })}
          onOpenTherapist={(therapistId) => setView({ kind: 'therapistDetail', therapistId })}
        />
      )}
      {view.kind === 'settings' && <SettingsScreen onClose={goMain} />}
      {view.kind === 'therapistDetail' && (
        <TherapistDetailScreen
          therapistId={view.therapistId}
          onBack={goMain}
          onBook={() =>
            setView({ kind: 'booking', mode: 'scheduled', therapistId: view.therapistId })
          }
        />
      )}
      {view.kind === 'booking' && (
        <BookingScreen
          therapistId={view.therapistId}
          mode={view.mode}
          onClose={goMain}
          onJoinCall={(booking) => setView({ kind: 'precall', booking })}
        />
      )}
      {view.kind === 'precall' && (
        <PreCallScreen
          therapistName={view.booking.therapistName}
          onBack={goMain}
          onJoin={() => setView({ kind: 'incall', booking: view.booking })}
        />
      )}
      {view.kind === 'incall' && (
        <InCallScreen
          therapistName={view.booking.therapistName}
          durationMin={view.booking.durationMin}
          onEnd={() => setView({ kind: 'postcall', booking: view.booking })}
        />
      )}
      {view.kind === 'postcall' && (
        <PostCallScreen
          bookingId={view.booking.id}
          therapistName={view.booking.therapistName}
          onClose={goMain}
        />
      )}
    </NavigationContainer>
  );
}
