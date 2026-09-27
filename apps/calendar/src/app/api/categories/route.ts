import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { categoryInputSchema } from "@/lib/validation";
import { getAppMembersById } from "@family/auth";

// GET /api/categories - all categories from both users (shared calendar)
export async function GET(request: Request) {
  const session = await getServerSession(request);
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  const owners = await getAppMembersById("calendar", categories.map((category) => category.ownerId));
  return NextResponse.json({ categories: categories.map((category) => ({ ...category, owner: owners.get(category.ownerId) ?? { id: category.ownerId, name: "Membre" } })) });
}

// POST /api/categories
export async function POST(request: Request) {
  const session = await getServerSession(request);
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = categoryInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const category = await prisma.category.create({
    data: { ...parsed.data, ownerId: session.user.id },
  });
  return NextResponse.json({ category }, { status: 201 });
}
