# components/train_test_data.py
# -------------------------------------------------------------
# Meta-model predictor for Mental Health + Sentiment analysis
# (No scaling version – consistent with your training notebook)
# -------------------------------------------------------------

import pickle
import logging
import numpy as np
from typing import List
import string

# --- External Libraries ---
from textblob import TextBlob
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

# --- Optional Empath import ---
try:
    from empath import Empath
    LEX = Empath()
except Exception:
    LEX = None

# --- NLTK Setup ---
import nltk, os, ssl
from nltk import pos_tag

# Custom local directory
NLTK_DIR = os.path.expanduser("~/nltk_new_data")
os.makedirs(NLTK_DIR, exist_ok=True)
nltk.data.path.append(NLTK_DIR)

# SSL fix for macOS
try:
    ssl._create_default_https_context = ssl._create_unverified_context
except Exception:
    pass

# Ensure resources exist
for pkg in ["punkt", "averaged_perceptron_tagger"]:
    try:
        nltk.data.find(f"tokenizers/{pkg}" if pkg == "punkt" else f"taggers/{pkg}")
    except LookupError:
        nltk.download(pkg, download_dir=NLTK_DIR, quiet=True)

# -------------------------------------------------------------
# Logging
# -------------------------------------------------------------
logger = logging.getLogger("train_test")
SIA = SentimentIntensityAnalyzer()

# -------------------------------------------------------------
# Safe Pickle Loader (for LightGBM and others)
# -------------------------------------------------------------
def load_pickle(path: str):
    """Safely load pickle files and handle LightGBM dependency."""
    try:
        try:
            import lightgbm  # noqa: F401
        except ModuleNotFoundError:
            import importlib
            importlib.import_module("lightgbm")

        with open(path, "rb") as f:
            obj = pickle.load(f)
        logger.info(f"✅ Loaded pickle: {path}")
        return obj
    except Exception as e:
        logger.error(f"❌ Failed to load pickle from {path}: {e}")
        raise e

# -------------------------------------------------------------
# Feature Extraction Helpers (same as in training)
# -------------------------------------------------------------
def text_stats_features(texts: List[str]) -> np.ndarray:
    """Basic text-level numerical stats."""
    rows = []
    for t in texts:
        words = t.split()
        word_count = len(words)
        avg_len = np.mean([len(w) for w in words]) if words else 0
        punct_ratio = sum(ch in string.punctuation for ch in t) / max(len(t), 1)
        rows.append([word_count, avg_len, punct_ratio])
    return np.array(rows)

def sentiment_features(texts: List[str]) -> np.ndarray:
    """VADER + TextBlob sentiment signals."""
    rows = []
    for t in texts:
        vs = SIA.polarity_scores(t)
        tb = TextBlob(t).sentiment
        rows.append([vs["compound"], tb.polarity, tb.subjectivity])
    return np.array(rows)

def pos_features(texts: List[str]) -> np.ndarray:
    """Part-of-speech composition."""
    rows = []
    for t in texts:
        tags = pos_tag(t.split())
        nouns = sum(1 for _, p in tags if p.startswith("N"))
        verbs = sum(1 for _, p in tags if p.startswith("V"))
        adjs = sum(1 for _, p in tags if p.startswith("J"))
        advs = sum(1 for _, p in tags if p.startswith("R"))
        rows.append([nouns, verbs, adjs, advs])
    return np.array(rows)

def empath_features(texts: List[str], categories: int = 40) -> np.ndarray:
    """Empath semantic categories (fallback = zeros)."""
    if LEX is None:
        logger.warning("⚠️ Empath unavailable — using zeros.")
        return np.zeros((len(texts), categories))

    cat_names = list(LEX.cats.keys())[:categories]
    out = []
    for t in texts:
        try:
            scores = LEX.analyze(t or "", normalize=True) or {}
            vals = [scores.get(cat, 0.0) for cat in cat_names]
        except Exception:
            vals = [0.0] * len(cat_names)
        out.append(vals)
    return np.array(out)

# -------------------------------------------------------------
# Main Meta-Model Predictor
# -------------------------------------------------------------
class MetaModelPredictor:
    def __init__(self, mh_model_path, mh_vec_path, base_lr_path, sent_model_path, sent_vec_path):
        self.mh_model = load_pickle(mh_model_path)
        self.mh_vec = load_pickle(mh_vec_path)
        self.base_lr = load_pickle(base_lr_path)
        self.sent_model = load_pickle(sent_model_path)
        self.sent_vec = load_pickle(sent_vec_path)

    def predict(self, texts: List[str]):
        """Run sentiment + mental health predictions."""
        try:
            # Sentiment model
            sent_features = self.sent_vec.transform(texts)
            sent_preds = list(self.sent_model.predict(sent_features))

            # Mental health model
            tfidf_feats = self.mh_vec.transform(texts)

            dense_feats = np.hstack([
                text_stats_features(texts),
                sentiment_features(texts),
                pos_features(texts),
                empath_features(texts)
            ])

            # Meta-layer features
            proba_lr = self.base_lr.predict_proba(tfidf_feats)
            meta_feats = np.hstack([proba_lr, dense_feats])

            mh_preds = list(self.mh_model.predict(meta_feats))
            logger.info(f"🧠 Predicted {len(texts)} samples successfully.")
            return mh_preds, sent_preds

        except Exception as e:
            logger.error(f"❌ Prediction error: {e}")
            raise e
