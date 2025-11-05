import praw
import pytz
from datetime import datetime, timedelta
import firebase_admin
from firebase_admin import credentials, db
from components.logger import logger
import config

if not firebase_admin._apps:
    cred = credentials.Certificate(config.FIREBASE_SERVICE_ACCOUNT)
    firebase_admin.initialize_app(cred, {'databaseURL': config.FIREBASE_DB_URL})

def fetch_tokens(username: str):
    try:
        ref = db.reference(f'/reddit_tokens/{username}')
        tokens = ref.get()
        if not tokens:
            logger.error(f"No tokens found in Firebase for username: {username}")
            return None
        return tokens
    except Exception as e:
        logger.error(f"Firebase token fetch error for {username}: {e}")
        return None

def get_reddit_client(tokens):
    try:
        reddit = praw.Reddit(
            client_id=config.REDDIT_CLIENT_ID,
            client_secret=config.REDDIT_CLIENT_SECRET,
            user_agent=config.REDDIT_USER_AGENT,
            refresh_token=tokens.get('refresh_token'),
        )
        logger.info(f"Initialized Reddit client for user: {tokens.get('username')}")
        return reddit
    except Exception as e:
        logger.error(f"Error initializing Reddit client: {e}")
        return None

def extract_merged_text(username: str, days=10):
    tokens = fetch_tokens(username)
    if tokens is None:
        logger.error("No tokens found, aborting extraction.")
        return None
    
    reddit = get_reddit_client(tokens)
    if reddit is None:
        logger.error("Could not init Reddit client, aborting extraction.")
        return None
    
    reddit_user = reddit.redditor(username)
    now = datetime.now(pytz.utc)
    cutoff = now - timedelta(days=days)

    merged_texts = []
    try:
        # recent posts
        for submission in reddit_user.submissions.new(limit=100):
            if datetime.fromtimestamp(submission.created_utc, pytz.utc) < cutoff:
                continue
            merged_texts.append(f"{submission.title} {submission.selftext}")
            if len(merged_texts) >= 10:
                break
        
        # recent comments + post info
        for comment in reddit_user.comments.new(limit=100):
            if datetime.fromtimestamp(comment.created_utc, pytz.utc) < cutoff:
                continue
            submission = comment.submission
            merged_comments = (f"{comment.body} (On post: {submission.title} {submission.selftext})")
            merged_texts.append(merged_comments)
            if len(merged_texts) >= 20:
                break

        logger.info(f"Extracted {len(merged_texts)} texts for user {username}")
        # Merge all to one string for model single text input
        return [' '.join(merged_texts)]
    except Exception as e:
        logger.error(f"Data extraction error: {e}")
        return None
