// src/app/api/connect/twitter/callback/route.ts
import { NextResponse } from "next/server";
import { TwitterApi } from "twitter-api-v2";
import { adminDB } from "@/lib/firebaseAdmin";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    if (!code || !state)
      return NextResponse.json({ error: "Missing OAuth params" }, { status: 400 });

    const tempDoc = await adminDB.collection("oauth_temp").doc(state).get();
    if (!tempDoc.exists)
      return NextResponse.json({ error: "Invalid state" }, { status: 400 });

    const { uid, codeVerifier } = tempDoc.data()!;

    const client = new TwitterApi({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    });

    const callbackUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/connect/twitter/callback`;

    const {
      client: loggedClient,
      accessToken,
      refreshToken,
      expiresIn,
    } = await client.loginWithOAuth2({
      code,
      codeVerifier,
      redirectUri: callbackUrl,
    });

    const me = await loggedClient.v2.me({
      "user.fields": ["created_at", "description", "public_metrics"],
    });

    await adminDB
      .collection("users")
      .doc(uid)
      .collection("tokens")
      .doc("twitter")
      .set(
        {
          accessToken,
          refreshToken,
          expiresAt: Date.now() + expiresIn * 1000,
          twitterId: me.data.id,
          username: me.data.username,
          name: me.data.name,
          description: me.data.description,
          metrics: me.data.public_metrics,
          connectedAt: new Date(),
        },
        { merge: true }
      );

    await adminDB.collection("oauth_temp").doc(state).delete();

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/profile-setup?oauth=twitter`
    );
  } catch (err: any) {
    console.error("Twitter callback error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
