# components/train_test_data.py
# -------------------------------------------------------------
# 🧠 Mental Health v3 Hybrid Predictor
# Combines TF-IDF + Dense Features + SBERT Embeddings
# Works with final_hybrid_model.pkl (stacking model)
# -------------------------------------------------------------

import os
import ssl
import pickle
import logging
import numpy as np
from typing import List
from scipy.sparse import hstack, csr_matrix

# External libs
import joblib
from sentence_transformers import SentenceTransformer
from textblob import TextBlob
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

# Optional Empath
try:
    from empath import Empath
    LEX = Empath()
except Exception:
    LEX = None

# NLTK Setup
import nltk
from nltk import pos_tag
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

NLTK_DIR = os.path.expanduser("~/nltk_new_data")
os.makedirs(NLTK_DIR, exist_ok=True)
nltk.data.path.append(NLTK_DIR)

try:
    ssl._create_default_https_context = ssl._create_unverified_context
except Exception:
    pass

for pkg in ["stopwords", "punkt", "averaged_perceptron_tagger", "wordnet"]:
    try:
        nltk.data.find(f"corpora/{pkg}")
    except LookupError:
        nltk.download(pkg, download_dir=NLTK_DIR, quiet=True)

STOPWORDS = set(stopwords.words("english"))
LEM = WordNetLemmatizer()
SIA = SentimentIntensityAnalyzer()

# -------------------------------------------------------------
# Logger setup
# -------------------------------------------------------------
logger = logging.getLogger("train_test")
logger.setLevel(logging.INFO)

# -------------------------------------------------------------
# Safe model loader
# -------------------------------------------------------------
def load_pickle(path: str):
    """Try pickle, then joblib fallback."""
    if not os.path.exists(path):
        raise FileNotFoundError(f"Missing model file: {path}")
    try:
        with open(path, "rb") as f:
            return pickle.load(f)
    except Exception:
        return joblib.load(path)

# -------------------------------------------------------------
# Feature helpers (exact same as in training)
# -------------------------------------------------------------
def text_stats_features(texts: List[str]) -> np.ndarray:
    rows = []
    for t in texts:
        words = t.split()
        word_count = len(words)
        avg_len = np.mean([len(w) for w in words]) if words else 0
        punct_ratio = sum(ch in "!?.,;:" for ch in t) / max(len(t), 1)
        rows.append([word_count, avg_len, punct_ratio])
    return np.array(rows)

def sentiment_features(texts: List[str]) -> np.ndarray:
    rows = []
    for t in texts:
        vs = SIA.polarity_scores(t)
        tb = TextBlob(t).sentiment
        rows.append([vs["compound"], tb.polarity, tb.subjectivity])
    return np.array(rows)

def pos_features(texts: List[str]) -> np.ndarray:
    rows = []
    for t in texts:
        tags = pos_tag(t.split())
        nouns = sum(1 for _, p in tags if p.startswith("N"))
        verbs = sum(1 for _, p in tags if p.startswith("V"))
        adjs = sum(1 for _, p in tags if p.startswith("J"))
        advs = sum(1 for _, p in tags if p.startswith("R"))
        rows.append([nouns, verbs, adjs, advs])
    return np.array(rows)

def empath_features(texts: List[str], categories=40) -> np.ndarray:
    if LEX is None:
        logger.warning("⚠️ Empath not available — using zeros.")
        return np.zeros((len(texts), categories))
    cat_names = list(LEX.cats.keys())[:categories]
    out = []
    for t in texts:
        try:
            scores = LEX.analyze(t, normalize=True)
            vals = [scores.get(cat, 0.0) for cat in cat_names]
        except Exception:
            vals = [0.0] * len(cat_names)
        out.append(vals)
    return np.array(out)

# -------------------------------------------------------------
# 🧠 Main Hybrid Predictor Class
# -------------------------------------------------------------
class MetaModelPredictor:
    def __init__(
        self,
        final_model_path: str,
        tfidf_path: str,
        scaler_path: str,
        sent_model_path: str,
        sent_vec_path: str,
        sbert_model_name: str = "all-MiniLM-L6-v2",
        empath_categories: int = 40,
    ):
        # Load all models
        self.final_model = load_pickle(final_model_path)
        self.tfidf = load_pickle(tfidf_path)
        self.scaler = load_pickle(scaler_path)
        self.sent_model = load_pickle(sent_model_path)
        self.sent_vec = load_pickle(sent_vec_path)
        self.empath_categories = empath_categories

        # Load transformer model (Sentence-BERT)
        logger.info(f"🔹 Loading SentenceTransformer: {sbert_model_name}")
        self.sbert = SentenceTransformer(sbert_model_name)

        logger.info("✅ Hybrid predictor initialized successfully.")

    # --------------------------
    # Feature builder
    # --------------------------
    def _build_features(self, texts: List[str]):
        """Build full feature stack: TF-IDF + Dense + SBERT"""
        tfidf_feats = self.tfidf.transform(texts)

        # Use exactly the 10 features used during training
        dense_feats = np.hstack([
            text_stats_features(texts),
            sentiment_features(texts),
            pos_features(texts)
        ])

        dense_scaled = self.scaler.transform(dense_feats)
        sbert_embeds = self.sbert.encode(texts, show_progress_bar=False)

        combined = hstack([
            tfidf_feats,
            csr_matrix(dense_scaled),
            csr_matrix(sbert_embeds)
        ])

        logger.debug(f"Built features shape: {combined.shape}")
        return combined



    # --------------------------
    # Prediction method
    # --------------------------
    def predict(self, texts: List[str]):
        try:
            # Sentiment
            sent_features = self.sent_vec.transform(texts)
            sent_preds = list(self.sent_model.predict(sent_features))

            # Mental health
            X = self._build_features(texts)
            mh_preds = list(self.final_model.predict(X))

            logger.info(f"🧠 Predicted {len(texts)} samples successfully.")
            return mh_preds, sent_preds
        except Exception as e:
            logger.error(f"❌ Prediction error: {e}")
            raise
