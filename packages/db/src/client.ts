import { PrismaClient } from "./generated";

const globalForPrisma = globalThis as unknown as { portalPrisma?: PrismaClient };

export const portalPrisma =
  globalForPrisma.portalPrisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.portalPrisma = portalPrisma;
}
