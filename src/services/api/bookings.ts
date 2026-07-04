import { http } from './client';
import type { TherapistDetail } from './therapists';

export type BookingMode = 'instant' | 'scheduled';

export type BookingStatus = 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export type Booking = {
  id: string;
  therapistId: string;
  therapistName: string;
  therapistSpecialty: string;
  mode: BookingMode;
  startsAtIso: string;
  durationMin: number;
  amountCents: number;
  status: BookingStatus;
  createdAtIso: string;
  rating?: number;
  tipCents?: number;
  notes?: string;
};

export type CreateBookingInput = {
  therapist: Pick<TherapistDetail, 'id' | 'name' | 'specialty' | 'hourlyRateCents'>;
  mode: BookingMode;
  startsAtIso: string;
  durationMin: number;
};

export type Slot = {
  iso: string;
  label: string;
};

function priceForDuration(hourlyRateCents: number, durationMin: number): number {
  return Math.round((hourlyRateCents * durationMin) / 60);
}

export const bookingsApi = {
  slots: (therapistId: string) => http<Slot[]>(`/therapists/${therapistId}/slots`),

  list: () => http<Booking[]>('/bookings'),

  create: (input: CreateBookingInput) =>
    http<Booking>('/bookings', {
      method: 'POST',
      body: {
        therapistId: input.therapist.id,
        mode: input.mode,
        startsAtIso: input.startsAtIso,
        durationMin: input.durationMin,
      },
    }),

  cancel: (id: string) => http<Booking>(`/bookings/${id}/cancel`, { method: 'PATCH' }),

  finishCall: (
    id: string,
    review: { rating: number; tipCents: number; notes: string },
  ) =>
    http<Booking>(`/bookings/${id}/finish`, {
      method: 'PATCH',
      body: review,
    }),
};

export const bookingHelpers = { priceForDuration };
