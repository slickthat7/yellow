import { PrismaClient, Role, ReviewStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding ReviewFlow database...');

  // Hash password for default accounts
  const defaultPasswordHash = await bcrypt.hash('password123', 10);

  // 1. Create Superadmin User
  const superadmin = await prisma.adminUser.upsert({
    where: { email: 'superadmin@reviewflow.io' },
    update: {},
    create: {
      email: 'superadmin@reviewflow.io',
      passwordHash: defaultPasswordHash,
      role: Role.SUPERADMIN,
    },
  });
  console.log('Created Superadmin:', superadmin.email);

  // 2. Create Apex Dental Studio Organization
  const apexOrg = await prisma.organization.upsert({
    where: { slug: 'apex-dental' },
    update: {},
    create: {
      name: 'Apex Dental Studio',
      slug: 'apex-dental',
      logoUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=200&auto=format&fit=crop&q=80',
      primaryColor: '#2563eb', // Blue
      googlePlaceId: 'ChIJN1t_tDeuEmsRUsoyG83frY4', // Sample Place ID
      ownerEmail: 'dr.smith@apexdental.com',
    },
  });

  // Create Apex Brand Admin
  await prisma.adminUser.upsert({
    where: { email: 'admin@apexdental.com' },
    update: {},
    create: {
      email: 'admin@apexdental.com',
      passwordHash: defaultPasswordHash,
      role: Role.BRAND_ADMIN,
      orgId: apexOrg.id,
    },
  });

  // Sample Reviews for Apex Dental
  await prisma.review.createMany({
    data: [
      {
        orgId: apexOrg.id,
        rating: 5,
        commentText: 'Dr. Smith and the hygienic team were gentle, fast, and professional! Hands down the best dental experience I have ever had.',
        customerName: 'Elena Rostova',
        customerContact: 'elena@example.com',
        status: ReviewStatus.RESOLVED,
      },
      {
        orgId: apexOrg.id,
        rating: 5,
        commentText: 'Super clean clinic and modern equipment. Painless teeth cleaning!',
        customerName: 'Marcus Vance',
        customerContact: '+1 (555) 234-5678',
        status: ReviewStatus.RESOLVED,
      },
      {
        orgId: apexOrg.id,
        rating: 2,
        commentText: 'Had to wait 35 minutes past my scheduled appointment time without any warning from reception.',
        customerName: 'David K.',
        customerContact: 'david.k@example.com',
        status: ReviewStatus.NEW,
        internalNotes: 'Office manager notified. Offering 15% discount on next hygiene check.',
      },
      {
        orgId: apexOrg.id,
        rating: 1,
        commentText: 'Billing error on my invoice. Charged twice for x-rays.',
        customerName: 'Sarah Jenkins',
        customerContact: 'sarah.j@example.com',
        status: ReviewStatus.IN_PROGRESS,
        internalNotes: 'Contacted accounting department to issue refund.',
      },
    ],
  });

  // 3. Create Gourmet Bistro Organization
  const bistroOrg = await prisma.organization.upsert({
    where: { slug: 'gourmet-bistro' },
    update: {},
    create: {
      name: 'Gourmet Bistro & Grill',
      slug: 'gourmet-bistro',
      logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80',
      primaryColor: '#dc2626', // Deep Red
      googlePlaceId: 'ChIJP3Sa8ziYEmsRUKgyG83frY4',
      ownerEmail: 'chef.chef@gourmetbistro.com',
    },
  });

  // Create Bistro Admin
  await prisma.adminUser.upsert({
    where: { email: 'admin@gourmetbistro.com' },
    update: {},
    create: {
      email: 'admin@gourmetbistro.com',
      passwordHash: defaultPasswordHash,
      role: Role.BRAND_ADMIN,
      orgId: bistroOrg.id,
    },
  });

  // Sample Reviews for Bistro
  await prisma.review.createMany({
    data: [
      {
        orgId: bistroOrg.id,
        rating: 5,
        commentText: 'Exquisite truffle pasta and top tier service! Will definitely bring family back here.',
        customerName: 'Chloe Bennett',
        customerContact: 'chloe@example.com',
        status: ReviewStatus.RESOLVED,
      },
      {
        orgId: bistroOrg.id,
        rating: 3,
        commentText: 'The steak was slightly overcooked, but the red wine sauce made up for it. Atmosphere was lovely.',
        customerName: 'Liam O’Connor',
        customerContact: 'liam@example.com',
        status: ReviewStatus.NEW,
      },
    ],
  });

  console.log('Database seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
