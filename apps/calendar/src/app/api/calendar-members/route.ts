import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { getAppMembers } from "@family/auth";

export async function GET(request: Request) {
  const session = await getServerSession(request);
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const members = await getAppMembers("calendar");

  return NextResponse.json({ members });
}
