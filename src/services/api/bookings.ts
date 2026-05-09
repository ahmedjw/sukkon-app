import { api } from './client';
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

const STORE: Booking[] = [
  {
    id: 'bk-seed-1',
    therapistId: 't2',
    therapistName: 'Dr. Tom Reed',
    therapistSpecialty: 'Family & Couples',
    mode: 'scheduled',
    startsAtIso: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    durationMin: 45,
    amountCents: 6750,
    status: 'COMPLETED',
    createdAtIso: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
  },
];

export type Slot = {
  iso: string;
  label: string;
};

function buildSlots(): Slot[] {
  const now = new Date();
  const out: Slot[] = [];
  const dayLabels = ['Today', 'Tomorrow', 'Day after'];

  for (let dayOffset = 0; dayOffset < 3; dayOffset++) {
    const base = new Date(now);
    base.setDate(now.getDate() + dayOffset);
    [10, 13, 16, 19].forEach((hour) => {
      const slot = new Date(base);
      slot.setHours(hour, 0, 0, 0);
      if (slot.getTime() <= now.getTime()) return;
      out.push({
        iso: slot.toISOString(),
        label: `${dayLabels[dayOffset]} · ${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`,
      });
    });
  }
  return out;
}

function priceForDuration(hourlyRateCents: number, durationMin: number): number {
  return Math.round((hourlyRateCents * durationMin) / 60);
}

export const bookingsApi = {
  slots: (therapistId: string) =>
    api<Slot[]>(`GET /therapists/${therapistId}/slots`, () => buildSlots()),

  list: () =>
    api<Booking[]>(`GET /bookings`, () =>
      [...STORE].sort((a, b) => b.startsAtIso.localeCompare(a.startsAtIso)),
    ),

  create: (input: CreateBookingInput) =>
    api<Booking>(`POST /bookings`, () => {
      const booking: Booking = {
        id: `bk-${Date.now()}`,
        therapistId: input.therapist.id,
        therapistName: input.therapist.name,
        therapistSpecialty: input.therapist.specialty,
        mode: input.mode,
        startsAtIso: input.startsAtIso,
        durationMin: input.durationMin,
        amountCents: priceForDuration(input.therapist.hourlyRateCents, input.durationMin),
        status: 'CONFIRMED',
        createdAtIso: new Date().toISOString(),
      };
      STORE.unshift(booking);
      return booking;
    }),

  cancel: (id: string) =>
    api<Booking>(`PATCH /bookings/${id}/cancel`, () => {
      const idx = STORE.findIndex((b) => b.id === id);
      if (idx === -1) throw new Error('Booking not found');
      STORE[idx] = { ...STORE[idx], status: 'CANCELLED' };
      return STORE[idx];
    }),

  finishCall: (
    id: string,
    review: { rating: number; tipCents: number; notes: string },
  ) =>
    api<Booking>(`PATCH /bookings/${id}/finish`, () => {
      const idx = STORE.findIndex((b) => b.id === id);
      if (idx === -1) throw new Error('Booking not found');
      STORE[idx] = {
        ...STORE[idx],
        status: 'COMPLETED',
        rating: review.rating,
        tipCents: review.tipCents,
        notes: review.notes,
      };
      return STORE[idx];
    }),
};

export const bookingHelpers = { priceForDuration };
