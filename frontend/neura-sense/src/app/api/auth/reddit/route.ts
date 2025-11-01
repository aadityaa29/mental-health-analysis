import { NextResponse } from "next/server";
import { adminAuth, adminDB  } from "@/lib/firebaseAdmin";
import crypto from "crypto";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = await adminAuth.verifyIdToken(token);
    const uid = decoded.uid;

    const state = crypto.randomUUID();

    await adminDB .collection("oauth_temp").doc(state).set({
      uid,
      createdAt: new Date(),
    });

    const redditAuthUrl = new URL("https://www.reddit.com/api/v1/authorize");
    redditAuthUrl.searchParams.set("client_id", process.env.REDDIT_CLIENT_ID!);
    redditAuthUrl.searchParams.set("response_type", "code");
    redditAuthUrl.searchParams.set("state", state);
    redditAuthUrl.searchParams.set("redirect_uri", process.env.REDDIT_REDIRECT_URI!);
    redditAuthUrl.searchParams.set("duration", "permanent");
    redditAuthUrl.searchParams.set("scope", "identity read history");

    return NextResponse.redirect(redditAuthUrl.toString());
  } catch (err: any) {
    console.error("Reddit Auth Error:", err);
    return NextResponse.json({ error: "Failed to authenticate user" }, { status: 401 });
  }
}
