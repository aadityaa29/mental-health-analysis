from components.logger import logger
from components.pipeline.data_extraction_reddit import extract_merged_text
from components.pipeline.data_extraction_twitter import extract_twitter_data
from components.pipeline.data_extraction_spotify import extract_spotify_data


def extract_all_platform_data(tokens: dict):
    """
    Merge user-generated text data from all connected platforms.
    Returns a unified list of text strings for model analysis.
    """
    all_texts = []

    # 🟥 Reddit
    if "reddit" in tokens:
        reddit_tokens = tokens["reddit"]
        reddit_username = reddit_tokens.get("username")
        logger.info(f"🔍 Extracting Reddit data for: {reddit_username}")
        reddit_texts = extract_merged_text(
            username=reddit_username,
            access_token=reddit_tokens.get("access_token"),
            refresh_token=reddit_tokens.get("refresh_token"),
        )
        if reddit_texts:
            all_texts.extend(reddit_texts)

    # 🟦 Twitter
    if "twitter" in tokens:
        twitter_tokens = tokens["twitter"]
        logger.info("🔍 Extracting Twitter data...")
        twitter_texts = extract_twitter_data(twitter_tokens.get("accessToken"))
        if twitter_texts:
            all_texts.extend(twitter_texts)

    # 🟩 Spotify
    if "spotify" in tokens:
        spotify_tokens = tokens["spotify"]
        logger.info("🔍 Extracting Spotify data...")
        spotify_texts = extract_spotify_data(spotify_tokens.get("access_token"))
        if spotify_texts:
            all_texts.extend(spotify_texts)

    logger.info(f"✅ Total merged texts collected: {len(all_texts)}")
    return all_texts
