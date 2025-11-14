// src/app/api/auth/reddit/callback/route.ts
import { NextResponse } from "next/server";
import axios from "axios";
import { adminDB } from "@/lib/firebaseAdmin";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    if (!code || !state) {
      return NextResponse.json({ error: "Missing code or state" }, { status: 400 });
    }

    // Load temp OAuth data (UID)
    const tempDoc = await adminDB.collection("oauth_temp").doc(state).get();
    if (!tempDoc.exists) {
      return NextResponse.json({ error: "Invalid state" }, { status: 400 });
    }

    const { uid } = tempDoc.data()!;

    // Exchange code → access + refresh tokens
    const tokenRes = await axios.post(
      "https://www.reddit.com/api/v1/access_token",
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.REDDIT_REDIRECT_URI!,
      }),
      {
        auth: {
          username: process.env.REDDIT_CLIENT_ID!,
          password: process.env.REDDIT_CLIENT_SECRET!,
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "NeuraSenseAI/1.0",
        }
      }
    );

    const tokenData = tokenRes.data as Record<string, any>;
    const accessToken = tokenData.access_token;

    // ✔ Fetch username via OAuth
    const meRes = await axios.get("https://oauth.reddit.com/api/v1/me", {
      headers: {
        Authorization: `bearer ${accessToken}`,
        "User-Agent": "NeuraSenseAI/1.0",
      }
    });

    const meData = meRes.data as any;
    const redditUsername = meData?.name ?? null;

    if (!redditUsername) {
      console.error("❌ Could not fetch Reddit username");
    }

    // Store EVERYTHING in Firestore
    await adminDB
      .collection("users")
      .doc(uid)
      .collection("tokens")
      .doc("reddit")
      .set(
        {
          ...tokenData,
          username: redditUsername,  // ✔ FIXED
          fetched_at: new Date(),
        },
        { merge: true }
      );

    // Clean temp entry
    await adminDB.collection("oauth_temp").doc(state).delete();

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/profile-setup?oauth=reddit`
    );

  } catch (err: any) {
    console.error("Reddit OAuth callback error:", err.response?.data || err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
