import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { requireAuth } from '../auth/middleware.js';
import { HttpError } from '../http/error.js';
import { perMinute } from '../http/rateLimit.js';
import { asyncHandler, parseBody } from '../http/validate.js';

export const bookingsRouter = Router();
bookingsRouter.use(requireAuth);

type BookingRow = Awaited<ReturnType<typeof prisma.booking.findFirst>>;

async function shape(row: NonNullable<BookingRow>) {
  const t = await prisma.therapist.findUnique({ where: { id: row.therapistId } });
  return {
    id: row.id,
    therapistId: row.therapistId,
    therapistName: t?.name ?? 'Therapist',
    therapistSpecialty: t?.specialty ?? '',
    mode: row.mode as 'instant' | 'scheduled',
    startsAtIso: row.startsAt.toISOString(),
    durationMin: row.durationMin,
    amountCents: row.amountCents,
    status: row.status as 'CONFIRMED' | 'COMPLETED' | 'CANCELLED',
    createdAtIso: row.createdAt.toISOString(),
    rating: row.rating ?? undefined,
    tipCents: row.tipCents ?? undefined,
    notes: row.notes ?? undefined,
    videoRoomId: row.videoRoomId ?? undefined,
  };
}

bookingsRouter.get(
  '/',
  asyncHandler(async (req) => {
    const rows = await prisma.booking.findMany({
      where: { clientId: req.user!.id },
      orderBy: { startsAt: 'desc' },
    });
    return Promise.all(rows.map(shape));
  }),
);

const CreateBody = z.object({
  therapistId: z.string().min(1),
  mode: z.enum(['instant', 'scheduled']),
  startsAtIso: z.string().datetime(),
  durationMin: z.number().int().positive(),
});

bookingsRouter.post(
  '/',
  perMinute(10),
  asyncHandler(async (req) => {
    const body = parseBody(req, CreateBody);
    const therapist = await prisma.therapist.findUnique({ where: { id: body.therapistId } });
    if (!therapist) throw new HttpError(404, 'Therapist not found');
    const amountCents = Math.round((therapist.hourlyRateCents * body.durationMin) / 60);
    const created = await prisma.booking.create({
      data: {
        clientId: req.user!.id,
        therapistId: therapist.id,
        mode: body.mode,
        startsAt: new Date(body.startsAtIso),
        durationMin: body.durationMin,
        amountCents,
        status: 'CONFIRMED',
      },
    });
    return shape(created);
  }),
);

bookingsRouter.patch(
  '/:id/cancel',
  asyncHandler(async (req) => {
    const existing = await prisma.booking.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.clientId !== req.user!.id) throw new HttpError(404, 'Booking not found');
    const updated = await prisma.booking.update({
      where: { id: existing.id },
      data: { status: 'CANCELLED' },
    });
    return shape(updated);
  }),
);

const FinishBody = z.object({
  rating: z.number().int().min(1).max(5),
  tipCents: z.number().int().min(0).default(0),
  notes: z.string().max(2000).default(''),
});

bookingsRouter.patch(
  '/:id/finish',
  asyncHandler(async (req) => {
    const body = parseBody(req, FinishBody);
    const existing = await prisma.booking.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.clientId !== req.user!.id) throw new HttpError(404, 'Booking not found');
    const updated = await prisma.booking.update({
      where: { id: existing.id },
      data: { status: 'COMPLETED', rating: body.rating, tipCents: body.tipCents, notes: body.notes },
    });
    return shape(updated);
  }),
);

bookingsRouter.get(
  '/:id/room',
  asyncHandler(async (req) => {
    const existing = await prisma.booking.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.clientId !== req.user!.id) throw new HttpError(404, 'Booking not found');
    // v0 stub — real impl: Daily.co createRoom + meeting token
    const roomId = existing.videoRoomId ?? `room-${existing.id}`;
    if (!existing.videoRoomId) {
      await prisma.booking.update({ where: { id: existing.id }, data: { videoRoomId: roomId } });
    }
    return { roomId, token: 'dev-token-not-validated' };
  }),
);
