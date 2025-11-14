import os
from dotenv import load_dotenv
import urllib.parse

load_dotenv()

# ------------------------------
# 🔥 FIREBASE ADMIN SDK
# ------------------------------
FIREBASE_PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID")
FIREBASE_CLIENT_EMAIL = os.getenv("FIREBASE_CLIENT_EMAIL")
FIREBASE_PRIVATE_KEY = os.getenv("FIREBASE_PRIVATE_KEY", "").replace("\\n", "\n")
FIREBASE_SERVICE_ACCOUNT_PATH = os.getenv("FIREBASE_SERVICE_ACCOUNT")
FIREBASE_DB_URL = os.getenv("FIREBASE_DB_URL", f"https://{FIREBASE_PROJECT_ID}.firebaseio.com")

# ------------------------------
# 🔥 REDDIT CONFIG
# ------------------------------
REDDIT_CLIENT_ID = os.getenv("REDDIT_CLIENT_ID")
REDDIT_CLIENT_SECRET = os.getenv("REDDIT_CLIENT_SECRET")
REDDIT_REDIRECT_URI = os.getenv("REDDIT_REDIRECT_URI")

# REQUIRED but missing earlier ⚠️
REDDIT_USER_AGENT = os.getenv(
    "REDDIT_USER_AGENT",
    "MentalAI/1.0 by u-YourRedditUsername"
)

# ------------------------------
# 🔵 TWITTER CONFIG
# ------------------------------

TWITTER_BEARER_TOKEN = os.getenv("TWITTER_BEARER_TOKEN")


# ------------------------------
# 🟢 SPOTIFY CONFIG
# ------------------------------
SPOTIFY_CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
SPOTIFY_CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")
SPOTIFY_REDIRECT_URI = os.getenv("SPOTIFY_REDIRECT_URI")

# ------------------------------
# 🌐 FIREBASE CLIENT SDK (Optional)
# ------------------------------
FIREBASE_API_KEY = os.getenv("NEXT_PUBLIC_FIREBASE_API_KEY")
FIREBASE_AUTH_DOMAIN = os.getenv("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN")
FIREBASE_PROJECT_ID_CLIENT = os.getenv("NEXT_PUBLIC_FIREBASE_PROJECT_ID")
FIREBASE_STORAGE_BUCKET = os.getenv("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET")
FIREBASE_MESSAGING_SENDER_ID = os.getenv("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID")
FIREBASE_APP_ID = os.getenv("NEXT_PUBLIC_FIREBASE_APP_ID")

# ------------------------------
# ⚙️ APP LOGGING
# ------------------------------
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
