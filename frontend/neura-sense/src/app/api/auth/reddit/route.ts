// src/app/api/auth/reddit/route.ts
import { NextResponse } from "next/server";
import { adminAuth, adminDB } from "@/lib/firebaseAdmin";
import crypto from "crypto";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const decoded = await adminAuth.verifyIdToken(token);
    const uid = decoded.uid;

    const state = crypto.randomUUID();

    await adminDB.collection("oauth_temp").doc(state).set({
      uid,
      provider: "reddit",
      createdAt: new Date(),
    });

    const redditUrl = new URL("https://www.reddit.com/api/v1/authorize");
    redditUrl.searchParams.set("client_id", process.env.REDDIT_CLIENT_ID!);
    redditUrl.searchParams.set("response_type", "code");
    redditUrl.searchParams.set("state", state);
    redditUrl.searchParams.set("redirect_uri", process.env.REDDIT_REDIRECT_URI!);
    redditUrl.searchParams.set("duration", "permanent");
    redditUrl.searchParams.set("scope", "identity read history");

    return NextResponse.redirect(redditUrl.toString());
  } catch (err) {
    console.error("Reddit Auth error:", err);
    return NextResponse.json({ error: "Auth failed" }, { status: 500 });
  }
}
