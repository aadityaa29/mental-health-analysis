# components/pipeline/data_extraction.py
import praw
import pytz
import requests
from datetime import datetime
from components.logger import logger
from components.firebase_client import db
from components.pipeline import config
import urllib.parse

# -------------------------------------------------------------
# 🔹 REDDIT TOKEN LOADER
# -------------------------------------------------------------
def get_reddit_tokens(user_id: str):
    snap = db.collection("users").document(user_id).collection("tokens").document("reddit").get()
    if not snap.exists:
        logger.info("❌ Reddit tokens not found")
        return None
    return snap.to_dict()


# -------------------------------------------------------------
# 🔹 REDDIT CLIENT
# -------------------------------------------------------------
def get_reddit_client(tokens: dict):
    try:
        reddit = praw.Reddit(
            client_id=config.REDDIT_CLIENT_ID,
            client_secret=config.REDDIT_CLIENT_SECRET,
            refresh_token=tokens.get("refresh_token"),
            user_agent=config.REDDIT_USER_AGENT,
        )
        return reddit
    except Exception as e:
        logger.error(f"❌ Reddit client init failed: {e}")
        return None


# -------------------------------------------------------------
# 🔥 REDDIT EXTRACTION (FINAL WORKING VERSION)
# -------------------------------------------------------------
def extract_reddit_text(user_id: str):
    tokens = get_reddit_tokens(user_id)
    if not tokens:
        logger.info("❌ No Reddit tokens found")
        return []

    username = tokens.get("username")
    if not username:
        logger.error("❌ No Reddit username stored")
        return []

    results = []

    # ---- Fetch POSTS ----
    try:
        url_posts = f"https://www.reddit.com/user/{username}/submitted.json"
        res = requests.get(url_posts, headers={"User-Agent": "Mozilla/5.0"}, timeout=10)
        data = res.json()

        for item in data.get("data", {}).get("children", []):
            post = item.get("data", {})
            text = f"{post.get('title','')} {post.get('selftext','')}".strip()
            ts = int(post.get("created_utc", 0) * 1000)

            if text:
                results.append({
                    "text": text,
                    "timestamp": ts,
                    "source": "reddit"
                })

        logger.info(f"🟠 Reddit posts extracted: {len(results)}")

    except Exception as e:
        logger.error(f"❌ Reddit post extraction error: {e}")

    # ---- Fetch COMMENTS ----
    try:
        url_comments = f"https://www.reddit.com/user/{username}/comments.json"
        res = requests.get(url_comments, headers={"User-Agent": "Mozilla/5.0"}, timeout=10)
        data = res.json()

        for item in data.get("data", {}).get("children", []):
            c = item.get("data", {})
            body = c.get("body", "")
            parent_title = c.get("link_title", "(Post)")
            ts = int(c.get("created_utc", 0) * 1000)

            if body:
                merged = f"{body} (On post: {parent_title})"
                results.append({
                    "text": merged,
                    "timestamp": ts,
                    "source": "reddit"
                })

        logger.info(f"🟠 Reddit total extracted (posts+comments): {len(results)}")

    except Exception as e:
        logger.error(f"❌ Reddit comment extraction error: {e}")

    return results


# -------------------------------------------------------------
# 🔹 TWITTER TOKEN LOADER
# -------------------------------------------------------------
def get_twitter_tokens(user_id: str):
    snap = db.collection("users").document(user_id).collection("tokens").document("twitter").get()
    if not snap.exists:
        return None
    return snap.to_dict()


# -------------------------------------------------------------
# 🔹 TWITTER EXTRACTION (minimal fixes + rate-limit detection)
# -------------------------------------------------------------
def extract_twitter_text(user_id: str):
    print("\n================ TWITTER EXTRACTION DEBUG ================")

    tokens = get_twitter_tokens(user_id)
    print("Tokens from Firestore:", tokens)

    if not tokens:
        print("No Twitter tokens → returning []")
        return []

    twitter_id = tokens.get("twitterId")
    print("Twitter ID:", twitter_id)

    # Load static bearer token
    raw_token = getattr(config, "TWITTER_BEARER_TOKEN", "")
    raw_token = raw_token.strip()
    bearer = urllib.parse.unquote(raw_token)

    print("Decoded token:", repr(bearer))

    if not bearer:
        print("No bearer token loaded!")
        return []

    url = f"https://api.twitter.com/2/users/{twitter_id}/tweets?max_results=50&tweet.fields=created_at"
    print("Final Twitter URL:", url)

    try:
        headers = {"Authorization": f"Bearer {bearer}"}
        res = requests.get(url, headers=headers, timeout=10)

        print("Twitter status:", res.status_code)

        # 👉 Detect rate limit (429)
        if res.status_code == 429:
            print("❌ Twitter is blocking you (Rate Limit 429)")
            print("Retry After:", res.headers.get("Retry-After"))
            return [{"source": "twitter", "text": "TWITTER_RATE_LIMITED", "timestamp": int(datetime.now().timestamp()*1000)}]

        print("Twitter response text:", res.text[:400])

        if res.status_code != 200:
            print("Non-200 → returning []")
            return []

        data = res.json()
        tweets = data.get("data", [])
        print("Tweets found:", len(tweets))

        results = []
        for t in tweets:
            if "created_at" not in t:
                continue

            ts = int(datetime.fromisoformat(t["created_at"].replace("Z", "+00:00")).timestamp() * 1000)
            results.append({
                "source": "twitter",
                "text": t.get("text", ""),
                "timestamp": ts
            })

        print("Final extracted tweets:", len(results))
        return results

    except Exception as e:
        print("TWITTER EXCEPTION:", str(e))
        return []


# -------------------------------------------------------------
# 🔹 SPOTIFY TOKEN LOADER
# -------------------------------------------------------------
def get_spotify_tokens(user_id: str):
    snap = db.collection("users").document(user_id).collection("tokens").document("spotify").get()
    if not snap.exists:
        return None
    return snap.to_dict()


# -------------------------------------------------------------
# 🔹 SPOTIFY EXTRACTION
# -------------------------------------------------------------
def extract_spotify_text(user_id: str):
    tokens = get_spotify_tokens(user_id)
    if not tokens:
        return []

    access = tokens.get("access_token")
    if not access:
        return []

    try:
        url = "https://api.spotify.com/v1/me/player/recently-played?limit=20"
        headers = {"Authorization": f"Bearer {access}"}
        data = requests.get(url, headers=headers, timeout=10).json()

        items = data.get("items", [])
        results = []

        for item in items:
            track = item.get("track", {})
            name = track.get("name")
            artists = ", ".join([a.get("name", "") for a in track.get("artists", [])])
            played_at = item.get("played_at")

            if not name or not played_at:
                continue

            ts = int(datetime.fromisoformat(played_at.replace("Z", "+00:00")).timestamp() * 1000)

            results.append({
                "source": "spotify",
                "text": f"Listened to {name} by {artists}",
                "timestamp": ts
            })

        logger.info(f"🟢 Spotify extracted {len(results)} items")
        return results

    except Exception as e:
        logger.error(f"❌ Spotify extraction failed: {e}")
        return []


# -------------------------------------------------------------
# 🔥 MERGE ALL SOURCES (SAME FORMAT)
# -------------------------------------------------------------
def extract_all_sources(user_id: str):
    reddit_data = extract_reddit_text(user_id)
    twitter_data = extract_twitter_text(user_id)
    spotify_data = extract_spotify_text(user_id)

    combined = reddit_data + twitter_data + spotify_data
    combined.sort(key=lambda x: x["timestamp"], reverse=True)

    return {
        "reddit": len(reddit_data),
        "twitter": len(twitter_data),
        "spotify": len(spotify_data),
        "items": combined if combined else fallback_data(),
    }


# -------------------------------------------------------------
# Fallback data
# -------------------------------------------------------------
def fallback_data():
    now = int(datetime.now().timestamp() * 1000)
    return [
        {"source": "fallback", "text": "Feeling overwhelmed recently...", "timestamp": now},
        {"source": "fallback", "text": "Trying to stay positive and focused.", "timestamp": now - 100000},
    ]
