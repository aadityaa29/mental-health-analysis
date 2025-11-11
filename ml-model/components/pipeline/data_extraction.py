# components/pipeline/data_extraction.py
# -------------------------------------------------------------
# Hardcoded test version (no Firebase, no dynamic tokens)
# Fetches Reddit posts/comments OR falls back to dummy text
# -------------------------------------------------------------

import praw
import pytz
from datetime import datetime, timedelta
from components.logger import logger
from components.pipeline import config  # ✅ fixed import (was wrong earlier)

# --- 🔧 Hardcoded Reddit token info for testing ---
HARDCODED_TOKENS = {
    "access_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IlNIQTI1NjpzS3dsMnlsV0VtMjVmcXhwTU40cWY4MXE2OWFFdWFyMnpLMUdhVGxjdWNZIiwidHlwIjoiSldUIn0.eyJzdWIiOiJ1c2VyIiwiZXhwIjoxNzYyNjMxNzYxLjM3Mzc0NiwiaWF0IjoxNzYyNTQ1MzYxLjM3Mzc0NiwianRpIjoibUpVdnJKdjE2cldlb21mU0tSWDVjMXZpcTNZMjV3IiwiY2lkIjoiSVVKdmtDdVZIcEgxMkFaVmFPdnItdyIsImxpZCI6InQyXzIwdjA5NTUxY3giLCJhaWQiOiJ0Ml8yMHYwOTU1MWN4IiwiYXQiOjEsImxjYSI6MTc2MTc0MDcwNTYzOSwic2NwIjoiZUp5S1ZpcEtUVXhSMGxIS1RFbk5LOGtzcVZUU1VjcklMQzdKTDZwVWlnVUVBQURfXzVCdENmVSIsInJjaWQiOiJJR19xcldzVzJqU1JIajZZSVVNWnBfYm9HWUFPbDA2RWRWSlNBOUhzR05jIiwiZmxvIjo4fQ.kAndCrVgvU4CPNYcGyIsl3NxAeiqgZyJ0mZ2S7mUjiImn5hmHCNDB5AAG6wQtwgbGDe5cIlenSwaRpxVb-2RMgKJ2h-p2GqxPDlLvFhRay5RPtJop_D6ok8bpKjUsP3ZOZCEXLr6SPSH6hCo_6VtWrGKLhJ5jPyBZPMJuAZDW_CxVfp0IKG2prNvFg8a5bOgLWupMmGoTNhngHxwpIXtRJ29VpfahZc2q3kuMZeIMQXIjEzi26ogrC28SEmMfDM35p11tac6VxNoUMmIiF-ji2X1IGiib-3DB_qG-dpNxlWQOb24ni2mbIaPjc8--jP50O559KFw0M5iWFHruA01Ng",
    "refresh_token": "205549755252513-4GPXfq8mWogll5QEJ0R-Rz0aIoWZZg",
    "username": "Annual-Nobody-2762",
}

# -------------------------------------------------------------
#  Reddit Client Initialization
# -------------------------------------------------------------
def get_reddit_client(username: str):
    """Initialize Reddit client using hardcoded credentials."""
    try:
        reddit = praw.Reddit(
            client_id=config.REDDIT_CLIENT_ID,
            client_secret=config.REDDIT_CLIENT_SECRET,
            user_agent=config.REDDIT_USER_AGENT,
            refresh_token=HARDCODED_TOKENS["refresh_token"],
        )
        logger.info(f"[TEST MODE] Initialized Reddit client for user: {username}")
        return reddit
    except Exception as e:
        logger.error(f"[TEST MODE] Reddit client initialization failed: {e}")
        return None


# -------------------------------------------------------------
#  Data Extraction Logic
# -------------------------------------------------------------
def extract_merged_text(username: str = HARDCODED_TOKENS["username"], days: int = 10):
    """Fetch recent Reddit submissions/comments for the given user.
       Returns list of merged text strings, or dummy text if failed."""
    reddit = get_reddit_client(username)

    # If Reddit client failed, return mock data to test downstream pipeline
    if reddit is None:
        logger.warning("[TEST MODE] Reddit client unavailable — using mock fallback text.")
        return [
            "I feel anxious and nervous about my upcoming exams.",
            "I've been feeling better lately after starting meditation.",
            "Sometimes I just want to stay in bed all day.",
            "Life has been tough, but I’m trying to stay positive.",
        ]

    try:
        reddit_user = reddit.redditor(username)
        now = datetime.now(pytz.utc)
        cutoff = now - timedelta(days=days)
        merged_texts = []

        # Extract submissions
        for submission in reddit_user.submissions.new(limit=50):
            created = datetime.fromtimestamp(submission.created_utc, pytz.utc)
            if created < cutoff:
                continue
            text = f"{submission.title} {submission.selftext}".strip()
            if text:
                merged_texts.append(text)
            if len(merged_texts) >= 10:
                break

        # Extract comments
        for comment in reddit_user.comments.new(limit=50):
            created = datetime.fromtimestamp(comment.created_utc, pytz.utc)
            if created < cutoff:
                continue
            submission = comment.submission
            merged_comments = f"{comment.body} (On post: {submission.title})".strip()
            if merged_comments:
                merged_texts.append(merged_comments)
            if len(merged_texts) >= 20:
                break

        logger.info(f"[TEST MODE] Extracted {len(merged_texts)} texts for user {username}")

        # Fallback if Reddit returned nothing
        if not merged_texts:
            logger.warning("[TEST MODE] No posts/comments found — using fallback text.")
            return [
                "I feel anxious and nervous about my upcoming exams.",
                "I've been feeling better lately after starting meditation.",
                "Sometimes I just want to stay in bed all day.",
                "Life has been tough, but I’m trying to stay positive.",
            ]

        return merged_texts

    except Exception as e:
        logger.error(f"[TEST MODE] Data extraction error: {e}")
        # Fallback text in case Reddit API fails mid-way
        return [
            "I feel anxious and nervous about my upcoming exams.",
            "I've been feeling better lately after starting meditation.",
            "Sometimes I just want to stay in bed all day.",
            "Life has been tough, but I’m trying to stay positive.",
        ]
