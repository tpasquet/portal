import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { eventInputSchema } from "@/lib/validation";
import { getAppMembersById } from "@family/auth";

type RouteParams = { params: Promise<{ id: string }> };

// PATCH /api/events/[id]
export async function PATCH(request: Request, { params }: RouteParams) {
  const session = await getServerSession(request);
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const { id } = await params;

  const existing = await prisma.event.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Événement introuvable" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = eventInputSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  const event = await prisma.event.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.startsAt !== undefined && { startsAt: new Date(data.startsAt) }),
      ...(data.endsAt !== undefined && { endsAt: new Date(data.endsAt) }),
      ...(data.allDay !== undefined && { allDay: data.allDay }),
      ...(data.rrule !== undefined && { rrule: data.rrule }),
      ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
    },
  });
  const owner = (await getAppMembersById("calendar", [event.ownerId])).get(event.ownerId);

  return NextResponse.json({ event: { ...event, owner: owner ?? { id: event.ownerId, name: "Membre", color: "#6366f1" } } });
}

// DELETE /api/events/[id]
export async function DELETE(request: Request, { params }: RouteParams) {
  const session = await getServerSession(request);
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const { id } = await params;

  const existing = await prisma.event.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Événement introuvable" }, { status: 404 });
  }

  await prisma.event.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
