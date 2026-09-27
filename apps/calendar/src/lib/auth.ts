import { headers } from "next/headers";
import { getAuthSession } from "@family/auth";

export async function getServerSession(request?: Request) {
  return getAuthSession(request ? request.headers : await headers());
}
