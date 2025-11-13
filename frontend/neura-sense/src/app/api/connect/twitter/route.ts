// src/app/api/connect/twitter/route.ts
import { NextResponse } from "next/server";
import { TwitterApi } from "twitter-api-v2";
import { adminDB } from "@/lib/firebaseAdmin";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const uid = url.searchParams.get("uid");

    if (!uid)
      return NextResponse.json({ error: "Missing UID" }, { status: 400 });

    const client = new TwitterApi({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    });

    const callbackUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/connect/twitter/callback`;

    const { url: authUrl, codeVerifier, state } = client.generateOAuth2AuthLink(
      callbackUrl,
      {
        scope: ["tweet.read", "users.read", "offline.access"],
      }
    );

    await adminDB.collection("oauth_temp").doc(state).set({
      uid,
      codeVerifier,
      provider: "twitter",
      createdAt: new Date(),
    });

    return NextResponse.redirect(authUrl);
  } catch (err: any) {
    console.error("Twitter connect error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
