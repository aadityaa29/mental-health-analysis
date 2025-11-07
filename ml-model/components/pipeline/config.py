import os
from dotenv import load_dotenv

# ✅ Ensure .env is loaded from the current working directory
load_dotenv(dotenv_path=os.path.join(os.getcwd(), ".env"))

# === Firebase Admin SDK Configuration ===
FIREBASE_PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID")
FIREBASE_CLIENT_EMAIL = os.getenv("FIREBASE_CLIENT_EMAIL")

# Handle optional private key
private_key = os.getenv("FIREBASE_PRIVATE_KEY")
FIREBASE_PRIVATE_KEY = private_key.replace("\\n", "\n") if private_key else None

# ✅ Corrected variable name
FIREBASE_SERVICE_ACCOUNT_PATH = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH")

# If not provided, build it from project name
FIREBASE_DB_URL = os.getenv("FIREBASE_DB_URL", f"https://{FIREBASE_PROJECT_ID}.firebaseio.com")

# === Reddit OAuth Credentials ===
REDDIT_CLIENT_ID = os.getenv("REDDIT_CLIENT_ID")
REDDIT_CLIENT_SECRET = os.getenv("REDDIT_CLIENT_SECRET")
REDDIT_USER_AGENT = os.getenv("REDDIT_USER_AGENT", "mental-health-analysis-app")
REDDIT_REDIRECT_URI = os.getenv("REDDIT_REDIRECT_URI")

# === Firebase Client SDK (Frontend use only, optional here) ===
FIREBASE_API_KEY = os.getenv("NEXT_PUBLIC_FIREBASE_API_KEY")
FIREBASE_AUTH_DOMAIN = os.getenv("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN")
FIREBASE_PROJECT_ID_CLIENT = os.getenv("NEXT_PUBLIC_FIREBASE_PROJECT_ID")
FIREBASE_STORAGE_BUCKET = os.getenv("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET")
FIREBASE_MESSAGING_SENDER_ID = os.getenv("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID")
FIREBASE_APP_ID = os.getenv("NEXT_PUBLIC_FIREBASE_APP_ID")

# === Other OAuth providers ===
SPOTIFY_CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
SPOTIFY_CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")
SPOTIFY_REDIRECT_URI = os.getenv("SPOTIFY_REDIRECT_URI")

# === Logging ===
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
