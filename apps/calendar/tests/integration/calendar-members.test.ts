import "dotenv/config";
import { beforeAll, afterAll, describe, expect, test, vi } from "vitest";
import { PrismaClient } from "@/generated/prisma";

const getAuthSessionMock = vi.fn();
const getAppMembersMock = vi.fn();

vi.mock("@family/auth", () => ({
  getAuthSession: getAuthSessionMock,
  getAppMembers: getAppMembersMock,
}));

const prisma = new PrismaClient();
const { GET } = await import("@/app/api/calendar-members/route");

const sessionUser = { id: "test-user" };

describe("calendar members API integration", () => {
  beforeAll(async () => {
    getAppMembersMock.mockResolvedValue([
      { id: "portal-terry", email: "terry@example.test", name: "Terry", color: "#6366f1" },
      { id: "portal-aurelie", email: "aurelie@example.test", name: "Aurélie", color: "#ec4899" },
    ]);
    sessionUser.id = "portal-terry";
    getAuthSessionMock.mockResolvedValue({ user: sessionUser });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test("returns both calendar members with their display colors", async () => {
    const response = await GET(new Request("http://localhost/api/calendar-members"));
    expect(response.status).toBe(200);

    const members = (await response.json()).members;
    expect(members).toHaveLength(2);
    expect(members).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ email: "terry@example.test", name: "Terry", color: expect.any(String) }),
        expect.objectContaining({ email: "aurelie@example.test", name: "Aurélie", color: expect.any(String) }),
      ]),
    );
  });
});
