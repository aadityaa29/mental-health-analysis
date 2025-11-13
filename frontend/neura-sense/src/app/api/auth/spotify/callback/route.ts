// src/app/api/auth/spotify/callback/route.ts
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

    const tempDoc = await adminDB.collection("oauth_temp").doc(state).get();
    if (!tempDoc.exists) {
      return NextResponse.json({ error: "Invalid state" }, { status: 400 });
    }

    const { uid } = tempDoc.data()!;

    // Exchange code for token
    const tokenRes = await axios.post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
      }).toString(),
      {
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(
              `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
            ).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    // FIX: cast to plain object
    const data = tokenRes.data as Record<string, any>;

    await adminDB
      .collection("users")
      .doc(uid)
      .collection("tokens")
      .doc("spotify")
      .set(
        {
          ...data, // works because data is now Object
          fetched_at: new Date(),
        },
        { merge: true }
      );

    await adminDB.collection("oauth_temp").doc(state).delete();

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/profile-setup?oauth=spotify`
    );
  } catch (err: any) {
    console.error("Spotify OAuth error:", err.response?.data || err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
