import type { NextRequest } from "next/server";
import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@family/auth";

const handlers = toNextJsHandler(auth);

function corsHeaders(request: NextRequest) {
	const origin = request.headers.get("origin");
	const allowedOrigins = [
		process.env.BETTER_AUTH_URL ?? "http://localhost:3100",
		process.env.CALENDAR_URL ? new URL(process.env.CALENDAR_URL).origin : "http://localhost:3100",
	];
	const headers = new Headers({
		"Access-Control-Allow-Credentials": "true",
		"Access-Control-Allow-Headers": "Content-Type, Authorization",
		"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
		Vary: "Origin",
	});
	if (origin && allowedOrigins.includes(origin)) {
		headers.set("Access-Control-Allow-Origin", origin);
	}
	return headers;
}

async function withCors(request: NextRequest, handler: (request: NextRequest) => Promise<Response>) {
	const response = await handler(request);
	const headers = new Headers(response.headers);
	for (const [key, value] of corsHeaders(request)) headers.set(key, value);
	return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

function assertProductionSecret() {
	if (process.env.NODE_ENV === "production" && !process.env.BETTER_AUTH_SECRET) {
		throw new Error("BETTER_AUTH_SECRET must be configured in production");
	}
}

export async function GET(request: NextRequest) {
	assertProductionSecret();
	return withCors(request, handlers.GET);
}

export async function POST(request: NextRequest) {
	assertProductionSecret();
	return withCors(request, handlers.POST);
}

export async function OPTIONS(request: NextRequest) {
	return new Response(null, { status: 204, headers: corsHeaders(request) });
}
