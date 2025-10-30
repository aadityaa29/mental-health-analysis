import { NextResponse } from "next/server";
import { adminDB  } from "@/lib/firebaseAdmin";
import axios from "axios";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    if (!code || !state) {
      return NextResponse.json({ error: "Missing code or state" }, { status: 400 });
    }

    // Exchange code for token
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
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    // ✅ Define type for Reddit token response
    interface RedditTokenResponse {
      access_token: string;
      token_type: string;
      expires_in: number;
      refresh_token?: string;
      scope: string;
    }

    const { data } = tokenRes as { data: RedditTokenResponse };

    // Fetch temporary OAuth state doc
    const tempDoc = await adminDB .collection("oauth_temp").doc(state).get();
    if (!tempDoc.exists) {
      return NextResponse.json({ error: "Invalid state" }, { status: 400 });
    }

    const { uid } = tempDoc.data()!;

    // Save Reddit tokens in Firestore
    await adminDB 
      .collection("users")
      .doc(uid)
      .collection("tokens")
      .doc("reddit")
      .set({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: data.expires_in,
        scope: data.scope,
        fetched_at: new Date(),
      });

    // Clean up temp OAuth state
    await adminDB .collection("oauth_temp").doc(state).delete();

    // Redirect to dashboard after success
    return NextResponse.redirect(new URL("/dashboard", req.url));
  } catch (err: any) {
    console.error("Reddit OAuth callback error:", err.response?.data || err.message || err);
    return NextResponse.json(
      { error: err.response?.data || err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
