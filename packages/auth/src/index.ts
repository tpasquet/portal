import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { portalPrisma } from "@family/db";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET ?? "local-development-secret-change-me",
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3100",
  trustedOrigins: [
    process.env.BETTER_AUTH_URL ?? "http://localhost:3100",
    process.env.CALENDAR_URL ?? "http://localhost:3100/calendar",
  ],
  database: prismaAdapter(portalPrisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
  },
  plugins: [admin()],
});

export type AuthSession = typeof auth.$Infer.Session;

export async function getAuthSession(headers: Headers) {
  return auth.api.getSession({ headers });
}

export async function getAppMembers(appKey: string) {
  const permissions = await portalPrisma.appPermission.findMany({
    where: { app: { key: appKey, enabled: true }, user: { banned: false } },
    select: { user: { select: { id: true, email: true, name: true, color: true } } },
    orderBy: { user: { name: "asc" } },
  });
  return permissions.map(({ user }) => user);
}

export async function getAppMembersById(appKey: string, ids: string[]) {
  const members = await getAppMembers(appKey);
  return new Map(members.filter((member) => ids.includes(member.id)).map((member) => [member.id, member]));
}
