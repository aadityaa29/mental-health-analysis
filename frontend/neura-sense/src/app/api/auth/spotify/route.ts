// src/app/api/auth/spotify/route.ts
import { NextResponse } from "next/server";
import { adminAuth, adminDB } from "@/lib/firebaseAdmin";
import crypto from "crypto";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");

  if (!token)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const decoded = await adminAuth.verifyIdToken(token);
  const uid = decoded.uid;

  const state = crypto.randomUUID();

  await adminDB.collection("oauth_temp").doc(state).set({
    uid,
    provider: "spotify",
    createdAt: new Date(),
  });

  const scope = [
    "user-read-recently-played",
    "user-top-read",
    "user-read-currently-playing",
    "user-read-playback-state",
  ].join(" ");

  const redirect = `https://accounts.spotify.com/authorize?${new URLSearchParams({
    response_type: "code",
    client_id: process.env.SPOTIFY_CLIENT_ID!,
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
    scope,
    state,
  }).toString()}`;

  return NextResponse.redirect(redirect);
}
