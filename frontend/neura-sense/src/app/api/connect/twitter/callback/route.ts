import { NextResponse } from "next/server";
import { TwitterApi } from "twitter-api-v2";
import { adminDB  } from "@/lib/firebaseAdmin";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    if (!code || !state) {
      return NextResponse.json({ error: "Missing code or state" }, { status: 400 });
    }

    // Retrieve the temporary OAuth record
    const tempRef = adminDB .collection("oauth_temp").doc(state);
    const tempSnap = await tempRef.get();

    if (!tempSnap.exists) {
      return NextResponse.json({ error: "Invalid or expired state" }, { status: 400 });
    }

    const { codeVerifier, uid } = tempSnap.data() as {
      codeVerifier: string;
      uid: string;
    };

    const client = new TwitterApi({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    });

    const callbackUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/connect/twitter/callback`;

    // Exchange code for access/refresh tokens
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

    // ✅ Fetch Twitter user details (fixed user.fields)
    const me = await loggedClient.v2.me({
      "user.fields": ["public_metrics", "created_at", "description"],
    });

    // Save tokens and user info in Firestore
    await adminDB 
      .collection("users")
      .doc(uid)
      .collection("tokens")
      .doc("twitter")
      .set({
        accessToken,
        refreshToken,
        expiresAt: Date.now() + expiresIn * 1000,
        twitterId: me.data.id,
        username: me.data.username,
        name: me.data.name,
        description: me.data.description,
        metrics: me.data.public_metrics,
        connectedAt: new Date(),
      });

    // Cleanup temp state
    await tempRef.delete();

    // Redirect to dashboard after success
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?twitter=connected`);
  } catch (err: any) {
    console.error("Twitter OAuth callback error:", err);
    return NextResponse.json({ error: err.message || "OAuth failed" }, { status: 500 });
  }
}
