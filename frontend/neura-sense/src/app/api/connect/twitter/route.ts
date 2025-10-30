import { NextResponse } from "next/server";
import { TwitterApi } from "twitter-api-v2";
import { adminDB  } from "@/lib/firebaseAdmin"; // ✅ fixed name

export async function GET(req: Request) {
  try {
    const urlObj = new URL(req.url);
    const uid = urlObj.searchParams.get("uid");

    if (!uid) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!;
    const callbackUrl = `${baseUrl}/api/connect/twitter/callback`;

    const client = new TwitterApi({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    });

    const scopes = ["tweet.read", "users.read", "offline.access"];

    const { url, codeVerifier, state } = client.generateOAuth2AuthLink(callbackUrl, {
      scope: scopes,
    });

    // Save verifier + uid temporarily in Firestore
    await adminDB .collection("oauth_temp").doc(state).set({
      codeVerifier,
      uid,
      provider: "twitter",
      createdAt: new Date(),
    });

    return NextResponse.redirect(url);
  } catch (err: any) {
    console.error("Twitter connect error:", err);
    return NextResponse.json({ error: err.message || "Connection failed" }, { status: 500 });
  }
}
