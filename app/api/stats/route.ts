import { NextResponse } from "next/server";
import { fetchGithubStats } from "../../../lib/github";

export async function POST(request: Request) {
  const token = process.env.GITHUB_TOKEN;

  let body: { username?: string };
  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const username = body.username?.trim();
  if (!username) {
    return NextResponse.json(
      { error: "Username is required" },
      { status: 400 }
    );
  }

  try {
    const stats = await fetchGithubStats(username, token);
    return NextResponse.json({ data: stats });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const lower = message.toLowerCase();
    const status = lower.includes("not found")
      ? 404
      : lower.includes("rate limit")
        ? 429
        : lower.includes("auth")
          ? 401
          : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
