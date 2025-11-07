import requests
from components.logger import logger

def extract_spotify_data(access_token: str, limit: int = 50):
    """
    Extracts recently played tracks from the user's Spotify history.
    Requires a valid Spotify access token.
    """
    try:
        if not access_token:
            logger.error("🚨 Missing Spotify access token.")
            return []

        logger.info("🟢 Extracting Spotify listening history...")

        headers = {
            "Authorization": f"Bearer {access_token}",
        }

        url = "https://api.spotify.com/v1/me/player/recently-played"
        params = {"limit": min(limit, 50)}

        response = requests.get(url, headers=headers, params=params)
        if response.status_code != 200:
            logger.error(f"🚨 Spotify API Error: {response.status_code} - {response.text}")
            return []

        data = response.json()
        items = data.get("items", [])

        if not items:
            logger.warning("⚠️ No recent Spotify tracks found.")
            return []

        # Create descriptive text entries like “Listening to Shape of You by Ed Sheeran”
        tracks = [
            f"Listening to {track['track']['name']} by {track['track']['artists'][0]['name']}"
            for track in items
        ]

        logger.info(f"✅ Extracted {len(tracks)} Spotify tracks.")
        return tracks

    except Exception as e:
        logger.error(f"🚨 Spotify extraction failed: {e}")
        return []
