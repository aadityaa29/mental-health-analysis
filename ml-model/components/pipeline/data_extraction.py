# components/pipeline/data_extraction.py

import praw
import pytz
import requests
from datetime import datetime, timedelta
from components.logger import logger
from components.firebase_client import db
from components.pipeline import config


# -------------------------------------------------------------
# 🔹 REDDIT TOKEN LOADER
# -------------------------------------------------------------
def get_reddit_tokens(user_id: str):
    doc_ref = db.collection("users").document(user_id).collection("tokens").document("reddit")
    snap = doc_ref.get()

    if not snap.exists:
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
            refresh_token=tokens["refresh_token"],
            user_agent=config.REDDIT_USER_AGENT,
        )
        return reddit
    except Exception as e:
        logger.error(f"❌ Reddit client init failed: {e}")
        return None


# -------------------------------------------------------------
# 🔹 REDDIT EXTRACTION
# -------------------------------------------------------------
def extract_reddit_text(user_id: str, days: int = 10):
    tokens = get_reddit_tokens(user_id)
    if not tokens:
        return []

    reddit = get_reddit_client(tokens)
    if not reddit:
        return []

    try:
        username = tokens.get("username")
        user = reddit.redditor(username)

        now = datetime.now(pytz.utc)
        cutoff = now - timedelta(days=days)

        results = []

        # Submissions
        for post in user.submissions.new(limit=50):
            created = datetime.fromtimestamp(post.created_utc, pytz.utc)
            if created < cutoff:
                continue

            text = f"{post.title} {post.selftext}".strip()
            if text:
                results.append({
                    "text": text,
                    "timestamp": int(post.created_utc * 1000)
                })

        # Comments
        for c in user.comments.new(limit=50):
            created = datetime.fromtimestamp(c.created_utc, pytz.utc)
            if created < cutoff:
                continue

            merged = f"{c.body} (On post: {c.submission.title})"
            results.append({
                "text": merged,
                "timestamp": int(c.created_utc * 1000)
            })

        logger.info(f"🟠 Reddit extracted {len(results)} items for {user_id}")
        return results

    except Exception as e:
        logger.error(f"❌ Reddit extraction error: {e}")
        return []


# -------------------------------------------------------------
# 🔹 TWITTER TOKEN LOADER
# -------------------------------------------------------------
def get_twitter_tokens(user_id: str):
    snap = db.collection("users").document(user_id).collection("tokens").document("twitter").get()
    return snap.to_dict() if snap.exists else None


# -------------------------------------------------------------
# 🔹 TWITTER EXTRACTION
# -------------------------------------------------------------
def extract_twitter_text(user_id: str):
    tokens = get_twitter_tokens(user_id)
    if not tokens:
        return []

    access = tokens.get("accessToken")
    twitter_id = tokens.get("twitterId")

    if not access or not twitter_id:
        return []

    try:
        url = f"https://api.twitter.com/2/users/{twitter_id}/tweets?max_results=50&tweet.fields=created_at"
        headers = {"Authorization": f"Bearer {access}"}

        res = requests.get(url, headers=headers)
        data = res.json()

        tweets = data.get("data", [])
        results = []

        for t in tweets:
            txt = t["text"]
            ts = int(datetime.fromisoformat(t["created_at"].replace("Z", "+00:00")).timestamp() * 1000)
            results.append({"text": txt, "timestamp": ts})

        logger.info(f"🔵 Twitter extracted {len(results)} items")
        return results

    except Exception as e:
        logger.error(f"❌ Twitter extraction failed: {e}")
        return []


# -------------------------------------------------------------
# 🔹 SPOTIFY TOKEN LOADER
# -------------------------------------------------------------
def get_spotify_tokens(user_id: str):
    snap = db.collection("users").document(user_id).collection("tokens").document("spotify").get()
    return snap.to_dict() if snap.exists else None


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

        res = requests.get(url, headers=headers)
        data = res.json()

        items = data.get("items", [])
        results = []

        for item in items:
            track = item.get("track", {})
            name = track.get("name")
            artists = ", ".join([a["name"] for a in track.get("artists", [])])
            played_at = item.get("played_at")

            if name and played_at:
                ts = int(datetime.fromisoformat(played_at.replace("Z", "+00:00")).timestamp() * 1000)
                results.append({
                    "text": f"Listened to {name} by {artists}",
                    "timestamp": ts
                })

        logger.info(f"🟢 Spotify extracted {len(results)} items")
        return results

    except Exception as e:
        logger.error(f"❌ Spotify extraction failed: {e}")
        return []


# -------------------------------------------------------------
# 🔥 MERGE ALL SOURCES
# -------------------------------------------------------------
def extract_all_sources(user_id: str):
    reddit_data = extract_reddit_text(user_id)
    twitter_data = extract_twitter_text(user_id)
    spotify_data = extract_spotify_text(user_id)

    combined = reddit_data + twitter_data + spotify_data

    if not combined:
        return fallback_data()

    combined.sort(key=lambda x: x["timestamp"], reverse=True)
    return combined


# -------------------------------------------------------------
# Fallback data
# -------------------------------------------------------------
def fallback_data():
    now = int(datetime.now().timestamp() * 1000)
    return [
        {"text": "Feeling overwhelmed recently...", "timestamp": now},
        {"text": "Trying to stay positive and focused.", "timestamp": now - 100000},
    ]
