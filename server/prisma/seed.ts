import { PrismaClient } from '@prisma/client';
import { hash } from '@node-rs/argon2';

const prisma = new PrismaClient();

const therapists = [
  { id: 't1', name: 'Dr. Layla Hassan', specialty: 'Anxiety & Depression', rating: 4.9, reviewsCount: 312, available: true, yearsExperience: 12, hourlyRateCents: 7500, gender: 'FEMALE', problems: ['ANXIETY', 'DEPRESSION'], languages: ['en', 'ar'], nextAvailable: 'Today, 6:30 PM', bio: 'Clinical psychologist specialising in CBT for anxiety and mood disorders. Warm, evidence-based, bilingual (EN/AR).' },
  { id: 't2', name: 'Dr. Tom Reed', specialty: 'Family & Couples', rating: 4.7, reviewsCount: 421, available: true, yearsExperience: 18, hourlyRateCents: 9000, gender: 'MALE', problems: ['FAMILY'], languages: ['en'], nextAvailable: 'Tomorrow, 10:00 AM', bio: 'Marriage and family therapist with two decades of practice. Focus on communication and attachment repair.' },
  { id: 't3', name: 'Dr. Ahmad Saleh', specialty: 'Addiction Recovery', rating: 4.8, reviewsCount: 188, available: false, yearsExperience: 9, hourlyRateCents: 6500, gender: 'MALE', problems: ['ADDICTION'], languages: ['en', 'ar'], nextAvailable: 'Wed, 4:00 PM', bio: 'Addiction specialist using motivational interviewing and relapse-prevention frameworks.' },
  { id: 't4', name: 'Dr. Sara Khoury', specialty: 'Trauma & PTSD', rating: 4.9, reviewsCount: 256, available: true, yearsExperience: 14, hourlyRateCents: 8500, gender: 'FEMALE', problems: ['TRAUMA', 'ANXIETY'], languages: ['en', 'ar'], nextAvailable: 'Today, 8:00 PM', bio: 'Trauma-focused EMDR practitioner. Specialises in complex PTSD and anxiety co-morbidities.' },
  { id: 't5', name: 'Dr. Maya Younes', specialty: 'Bipolar specialist', rating: 4.8, reviewsCount: 142, available: true, yearsExperience: 11, hourlyRateCents: 7800, gender: 'FEMALE', problems: ['BIPOLAR'], languages: ['en', 'ar'], nextAvailable: 'Today, 7:00 PM', bio: 'Mood-disorder specialist with extensive experience in bipolar I/II care planning.' },
  { id: 't6', name: 'Dr. Karim Adel', specialty: 'Mood disorders', rating: 4.6, reviewsCount: 98, available: true, yearsExperience: 7, hourlyRateCents: 5500, gender: 'MALE', problems: ['BIPOLAR', 'DEPRESSION'], languages: ['ar'], nextAvailable: 'Tomorrow, 1:00 PM', bio: 'Psychiatrist focused on mood disorders, integrative care, and lifestyle coaching.' },
  { id: 't7', name: 'Dr. Hadi Nassar', specialty: 'Psychosis care', rating: 4.7, reviewsCount: 174, available: false, yearsExperience: 16, hourlyRateCents: 8200, gender: 'MALE', problems: ['SCHIZOPHRENIA'], languages: ['en', 'ar'], nextAvailable: 'Thu, 3:30 PM', bio: 'Senior clinician with deep experience in schizophrenia and psychosis-spectrum care.' },
  { id: 't8', name: 'Dr. Rana Othman', specialty: 'Schizophrenia', rating: 4.9, reviewsCount: 205, available: true, yearsExperience: 13, hourlyRateCents: 7900, gender: 'FEMALE', problems: ['SCHIZOPHRENIA'], languages: ['en', 'ar'], nextAvailable: 'Today, 5:00 PM', bio: 'Cognitive remediation and family-focused therapy for schizophrenia spectrum disorders.' },
  { id: 't9', name: 'Dr. Lina Farah', specialty: 'CBT for depression', rating: 4.7, reviewsCount: 162, available: true, yearsExperience: 8, hourlyRateCents: 6200, gender: 'FEMALE', problems: ['DEPRESSION', 'ANXIETY'], languages: ['en', 'ar'], nextAvailable: 'Today, 9:00 PM', bio: 'Short-term CBT and behavioural activation. Practical, structured, goal-oriented.' },
  { id: 't10', name: 'Dr. Yusuf Tarek', specialty: 'Anxiety disorders', rating: 4.8, reviewsCount: 219, available: true, yearsExperience: 10, hourlyRateCents: 7000, gender: 'MALE', problems: ['ANXIETY'], languages: ['en'], nextAvailable: 'Tomorrow, 11:00 AM', bio: 'Specialises in panic, social anxiety, and OCD. Uses exposure-response prevention.' },
  { id: 't11', name: 'Dr. Noor Mansour', specialty: 'Substance use', rating: 4.6, reviewsCount: 84, available: true, yearsExperience: 6, hourlyRateCents: 5000, gender: 'FEMALE', problems: ['ADDICTION'], languages: ['ar'], nextAvailable: 'Tomorrow, 2:00 PM', bio: 'Substance-use counsellor blending CBT with harm-reduction approaches.' },
];

const sessions = [
  { id: 'sp1', title: 'Breathe & Reset (10 min)', category: 'Mindful', durationMin: 10, description: 'A short box-breathing routine to reset your nervous system in the middle of the day.', author: 'Dr. Layla Hassan', popular: false },
  { id: 'sp2', title: 'Sleep Wind-down', category: 'Sleep', durationMin: 18, description: 'A guided body-scan and progressive relaxation to help you ease into sleep.', author: 'Dr. Sara Khoury', popular: false },
  { id: 'sp3', title: 'Anxious Mornings', category: 'Anxiety', durationMin: 12, description: 'Grounding practice for the first 12 minutes of your day. Less spiral, more steadiness.', author: 'Dr. Lina Farah', popular: false },
  { id: 'sp4', title: 'Self-compassion Walk', category: 'Self', durationMin: 15, description: 'A walking meditation to soften self-criticism and reconnect with your values.', author: 'Dr. Maya Younes', popular: false },
  { id: 'sp5', title: 'Letting Go of the Day', category: 'Mindful', durationMin: 8, description: 'A short practice to close the workday cleanly before transitioning to home life.', author: 'Dr. Tom Reed', popular: false },
  { id: 'sp6', title: 'Family Tension Reset', category: 'Family', durationMin: 14, description: 'A pause-before-react practice for moments of family tension.', author: 'Dr. Tom Reed', popular: false },
  { id: 'pop-1', title: 'Relaxing — A Conversation with Dr. Tom & Dr. Ahmad', category: 'Featured', durationMin: 32, description: 'A long-form conversation about everyday rituals that move us from tension to ease.', author: 'Dr. Tom & Dr. Ahmad', popular: true },
];

const podcasts = [
  { id: 'pc1', title: 'On Sleep, Stillness, and Self', author: 'Dr. Layla Hassan', durationMin: 28, category: 'self', description: 'A long conversation about why sleep is the foundation of mental health.' },
  { id: 'pc2', title: 'Modern Marriage, Old Wisdom', author: 'Dr. Tom Reed', durationMin: 41, category: 'spouse', description: 'On building partnerships that survive the noise of modern life.' },
  { id: 'pc3', title: 'When Your Kid Stops Talking', author: 'Dr. Sara Khoury', durationMin: 33, category: 'kids', description: 'How to keep the door open during the silent years.' },
  { id: 'pc4', title: 'Family Recipes, Family Repair', author: 'Dr. Karim Adel', durationMin: 22, category: 'food', description: 'How a shared meal can become an unspoken apology.' },
  { id: 'pc5', title: 'Belonging in a Big World', author: 'Dr. Maya Younes', durationMin: 36, category: 'world', description: 'On loneliness, the modern city, and finding your people.' },
  { id: 'pc6', title: 'The Family Circle', author: 'Dr. Tom Reed', durationMin: 29, category: 'family', description: 'Conversations that hold a family together when the years get heavy.' },
];

const posts = [
  { id: 'p1', authorName: 'Manar Hassan', topic: 'general', body: 'First mood log today: 7/10. Small wins count.', minutesAgo: 35 },
  { id: 'p2', authorName: 'Adam K.', topic: 'friends', body: 'Asked an old friend how they were really doing. They cried. We talked for an hour. Worth it.', minutesAgo: 60 * 5 },
  { id: 'p3', authorName: 'Layla F.', topic: 'health', body: 'Day 14 of walking 30 min before breakfast. The morning anxiety has actually moved.', minutesAgo: 60 * 24 },
  { id: 'p4', authorName: 'Yusuf T.', topic: 'community', body: 'Question for everyone: what helped you the most when you started therapy?', minutesAgo: 60 * 36 },
  { id: 'p5', authorName: 'Sara K.', topic: 'marriage', body: 'We started reading the same book before bed instead of scrolling. Tiny change, big shift.', minutesAgo: 60 * 48 },
];

async function main() {
  // Demo client
  const passwordHash = await hash('password123');
  const demoUser = await prisma.user.upsert({
    where: { email: 'manar@sukoun.app' },
    update: {},
    create: {
      email: 'manar@sukoun.app',
      name: 'Manar',
      passwordHash,
      locale: 'en',
      role: 'CLIENT',
    },
  });

  for (const t of therapists) {
    await prisma.therapist.upsert({
      where: { id: t.id },
      update: {},
      create: {
        id: t.id,
        name: t.name,
        specialty: t.specialty,
        rating: t.rating,
        reviewsCount: t.reviewsCount,
        available: t.available,
        yearsExperience: t.yearsExperience,
        hourlyRateCents: t.hourlyRateCents,
        gender: t.gender,
        bio: t.bio,
        languages: JSON.stringify(t.languages),
        problems: JSON.stringify(t.problems),
        nextAvailable: t.nextAvailable,
        verified: true,
      },
    });
  }

  for (const s of sessions) {
    await prisma.session.upsert({
      where: { id: s.id },
      update: {},
      create: s,
    });
  }

  for (const p of podcasts) {
    await prisma.podcast.upsert({
      where: { id: p.id },
      update: {},
      create: p,
    });
  }

  for (const p of posts) {
    await prisma.post.upsert({
      where: { id: p.id },
      update: {},
      create: {
        id: p.id,
        authorName: p.authorName,
        topic: p.topic,
        body: p.body,
        createdAt: new Date(Date.now() - p.minutesAgo * 60 * 1000),
      },
    });
  }

  // Seed booking history for demo user
  await prisma.booking.upsert({
    where: { id: 'bk-seed-1' },
    update: {},
    create: {
      id: 'bk-seed-1',
      clientId: demoUser.id,
      therapistId: 't2',
      mode: 'scheduled',
      startsAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
      durationMin: 45,
      amountCents: 6750,
      status: 'COMPLETED',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
    },
  });

  console.log('Seed complete.');
  console.log('Demo user: manar@sukoun.app / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
