import praw
import pytz
from datetime import datetime, timedelta
from components.logger import logger
from components.pipeline import config


def get_reddit_client(access_token=None, refresh_token=None):
    """
    Initialize Reddit client directly using provided tokens.
    """
    try:
        reddit = praw.Reddit(
            client_id=config.REDDIT_CLIENT_ID,
            client_secret=config.REDDIT_CLIENT_SECRET,
            user_agent=getattr(config, "REDDIT_USER_AGENT", "mental-health-analysis-app"),
            refresh_token=refresh_token
        )
        logger.info("✅ Reddit client initialized successfully.")
        return reddit
    except Exception as e:
        logger.error(f"🚨 Error initializing Reddit client: {e}")
        return None


def extract_merged_text(username: str, days=10, access_token=None, refresh_token=None):
    """
    Extracts posts + comments for the given Reddit username.
    """
    logger.info(f"🟢 Extracting Reddit data for user: {username}")

    reddit = get_reddit_client(access_token=access_token, refresh_token=refresh_token)
    if reddit is None:
        logger.error("❌ Could not initialize Reddit client.")
        return None

    reddit_user = reddit.redditor(username)
    now = datetime.now(pytz.utc)
    cutoff = now - timedelta(days=days)

    merged_texts = []
    try:
        # 📝 Get submissions
        for submission in reddit_user.submissions.new(limit=50):
            created = datetime.fromtimestamp(submission.created_utc, pytz.utc)
            if created < cutoff:
                continue
            merged_texts.append(f"{submission.title} {submission.selftext}".strip())

        # 💬 Get comments
        for comment in reddit_user.comments.new(limit=50):
            created = datetime.fromtimestamp(comment.created_utc, pytz.utc)
            if created < cutoff:
                continue
            text = f"{comment.body} (On post: {comment.submission.title})".strip()
            merged_texts.append(text)

        if not merged_texts:
            logger.warning(f"⚠️ No posts/comments found for {username}.")
            return None

        logger.info(f"✅ Extracted {len(merged_texts)} texts for {username}")
        return [' '.join(merged_texts)]

    except Exception as e:
        logger.error(f"🚨 Data extraction error for {username}: {e}")
        return None
