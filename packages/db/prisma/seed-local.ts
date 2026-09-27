import { hashPassword } from "better-auth/crypto";
import { randomUUID } from "node:crypto";
import { portalPrisma } from "../src/client";

const initialUsers = [
  {
    email: process.env.PORTAL_SEED_TERRY_EMAIL ?? "terry.pasquet@proton.me",
    password: process.env.PORTAL_SEED_TERRY_PASSWORD,
    name: "Terry",
  },
  {
    email: process.env.PORTAL_SEED_AURELIE_EMAIL ?? "aurelie.manier@gmail.com",
    password: process.env.PORTAL_SEED_AURELIE_PASSWORD,
    name: "Aurélie",
  },
];

async function main() {
  const calendar = await portalPrisma.app.upsert({
    where: { key: "calendar" },
    update: { enabled: true },
    create: {
      id: randomUUID(),
      key: "calendar",
      name: "Calendrier",
      url: process.env.CALENDAR_URL ?? "http://localhost:3100/calendar",
      description: "Calendrier familial partagé",
    },
  });

  for (const initialUser of initialUsers) {
    if (!initialUser.password) throw new Error(`Missing password for ${initialUser.email}`);
    const user = await portalPrisma.user.upsert({
      where: { email: initialUser.email },
      update: { name: initialUser.name, role: "admin", banned: false },
      create: { id: randomUUID(), name: initialUser.name, email: initialUser.email, role: "admin" },
    });
    await portalPrisma.account.upsert({
      where: { providerId_accountId: { providerId: "credential", accountId: user.id } },
      update: { password: await hashPassword(initialUser.password) },
      create: { id: randomUUID(), accountId: user.id, providerId: "credential", userId: user.id, password: await hashPassword(initialUser.password) },
    });
    await portalPrisma.appPermission.upsert({
      where: { userId_appId: { userId: user.id, appId: calendar.id } },
      update: {},
      create: { id: randomUUID(), userId: user.id, appId: calendar.id },
    });
    console.log(`Portal user ready: ${initialUser.email}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => portalPrisma.$disconnect());