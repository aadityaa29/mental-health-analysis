import requests
from components.logger import logger

def extract_twitter_data(access_token: str, limit: int = 50):
    """
    Extracts recent tweets (user posts) using Twitter API v2.
    Requires a valid Bearer token (OAuth2 user token).
    """
    try:
        if not access_token:
            logger.error("🚨 Missing Twitter access token.")
            return []

        logger.info("🟢 Extracting Twitter data...")

        headers = {
            "Authorization": f"Bearer {access_token}",
            "User-Agent": "NeuraSense-Twitter-Data-Fetcher",
        }

        # Twitter v2 endpoint to get recent tweets from the authenticated user
        url = f"https://api.twitter.com/2/users/me/tweets"
        params = {
            "max_results": min(limit, 100),
            "tweet.fields": "created_at,text",
        }

        response = requests.get(url, headers=headers, params=params)
        if response.status_code != 200:
            logger.error(f"🚨 Twitter API Error: {response.status_code} - {response.text}")
            return []

        data = response.json()
        tweets = [t["text"] for t in data.get("data", [])]

        if not tweets:
            logger.warning("⚠️ No tweets found for this user.")
            return []

        logger.info(f"✅ Extracted {len(tweets)} tweets from Twitter.")
        return tweets

    except Exception as e:
        logger.error(f"🚨 Twitter extraction failed: {e}")
        return []
