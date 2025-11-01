# components/pipeline/data_extraction.py

from components.logger import logger
import praw
import firebase_admin
from firebase_admin import credentials, db
from datetime import datetime, timedelta
import pytz

def fetch_reddit_keys_and_username(user_id):
    try:
        ref = db.reference(f'/reddit_keys/{user_id}')
        data = ref.get()
        if data is None:
            logger.error(f"No data found for user_id: {user_id}")
            return None
        logger.info(f"Fetched Reddit keys and username for user_id: {user_id}")
        return {
            'client_id': data['client_id'],
            'client_secret': data['client_secret'],
            'user_agent': data['user_agent'],
            'username': data['username']
        }
    except Exception as e:
        logger.error(f"Error fetching Reddit keys from Firebase: {str(e)}")
        return None

def extract_recent_user_content(reddit_user, days=10):
    now = datetime.now(pytz.utc)
    cutoff = now - timedelta(days=days)
    merged_texts = []

    try:
        for submission in reddit_user.submissions.new(limit=None):
            if datetime.fromtimestamp(submission.created_utc, pytz.utc) < cutoff:
                continue
            title = submission.title or ''
            selftext = submission.selftext or ''
            comments_text = []
            for comment in reddit_user.comments.new(limit=None):
                if comment.link_id.split('_')[-1] == submission.id and \
                   datetime.fromtimestamp(comment.created_utc, pytz.utc) >= cutoff:
                    comments_text.append(comment.body)
            merged = ' '.join([title, selftext] + comments_text)
            merged_texts.append({
                'post_id': submission.id,
                'merged_text': merged
            })
        logger.info(f"Extracted and merged text data for user: {reddit_user.name}")
    except Exception as e:
        logger.error(f"Failed to extract content for user {reddit_user.name}: {str(e)}")
    return merged_texts

# Example main function
def main(user_id):
    try:
        params = fetch_reddit_keys_and_username(user_id)
        if params is None:
            logger.warning("Reddit params are None, aborting extraction.")
            return
        reddit = praw.Reddit(
            client_id=params['client_id'],
            client_secret=params['client_secret'],
            user_agent=params['user_agent']
        )
        reddit_user = reddit.redditor(params['username'])
        user_text_data = extract_recent_user_content(reddit_user, days=10)
        # Process further or send to model/backend
        logger.info(f"Data extraction complete for user: {params['username']}")
    except Exception as e:
        logger.critical(f"Fatal error in main pipeline: {str(e)}")

if __name__ == "__main__":
    main('USER_ID')  # Replace with actual User ID
