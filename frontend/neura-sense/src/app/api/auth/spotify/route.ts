import { NextResponse } from "next/server";
import crypto from "crypto";
import { adminDB  } from "@/lib/firebaseAdmin";

export async function GET(req: Request) {
  const state = crypto.randomUUID();

  // Store temporary state for the logged-in user
  const url = new URL(req.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Decode Firebase JWT to get user ID
  const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken: token }),
  });
  const data = await res.json();
  const uid = data?.users?.[0]?.localId;

  if (!uid) {
    return NextResponse.json({ error: "Invalid user" }, { status: 400 });
  }

  await adminDB .collection("oauth_temp").doc(state).set({ uid, provider: "spotify" });

  const scope = [
    "user-read-recently-played",
    "user-top-read",
    "user-read-currently-playing",
    "user-read-playback-state"
  ].join(" ");

  const queryParams = new URLSearchParams({
    response_type: "code",
    client_id: process.env.SPOTIFY_CLIENT_ID!,
    scope,
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
    state,
  });

  return NextResponse.redirect(`https://accounts.spotify.com/authorize?${queryParams.toString()}`);
}
