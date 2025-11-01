import { NextResponse } from "next/server";
import axios from "axios";
import { adminDB  } from "@/lib/firebaseAdmin";

interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
  refresh_token: string;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    if (!code || !state) {
      return NextResponse.json({ error: "Missing code or state" }, { status: 400 });
    }

    const tempDoc = await adminDB .collection("oauth_temp").doc(state).get();
    if (!tempDoc.exists) {
      return NextResponse.json({ error: "Invalid state" }, { status: 400 });
    }

    const { uid } = tempDoc.data()!;

    const tokenRes = await axios.post<SpotifyTokenResponse>(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
      }),
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

    const data = tokenRes.data;

    await adminDB 
      .collection("users")
      .doc(uid)
      .collection("tokens")
      .doc("spotify")
      .set({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: data.expires_in,
        scope: data.scope,
        fetched_at: new Date(),
      });

    await adminDB .collection("oauth_temp").doc(state).delete();

    return NextResponse.redirect(new URL("/dashboard", req.url));
  } catch (err: any) {
    console.error("Spotify OAuth error:", err.response?.data || err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
