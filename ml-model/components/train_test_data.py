# components/train_test_data.py
# -------------------------------------------------------------
# 🧠 Mental Health Transformer + Sentiment Predictor (Dual Input Support)
# -------------------------------------------------------------
import os
import pickle
import joblib
import numpy as np
import logging
from typing import List
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from textblob import TextBlob

# -------------------------------------------------------------
# Logger Setup
# -------------------------------------------------------------
logger = logging.getLogger("train_test")
logger.setLevel(logging.INFO)
SIA = SentimentIntensityAnalyzer()

# -------------------------------------------------------------
# Helpers
# -------------------------------------------------------------
def load_pickle(path: str):
    """Try pickle first, then joblib as fallback."""
    if not os.path.exists(path):
        raise FileNotFoundError(f"Missing file: {path}")
    try:
        with open(path, "rb") as f:
            return pickle.load(f)
    except Exception:
        return joblib.load(path)
    
# -------------------------------------------------------------
# 🧠 Hybrid Predictor (Transformer + Sentiment)
# -------------------------------------------------------------

class MetaModelPredictor:
    def __init__(
        self,
        transformer_model_dir: str,
        sent_model_path: str,
        sent_vec_path: str,
        device: str = None,
    ):
        # ---- Load Mental Health Transformer ----
        logger.info(f"🔹 Loading Transformer model from {transformer_model_dir}")
        self.tokenizer = AutoTokenizer.from_pretrained(transformer_model_dir)
        self.model = AutoModelForSequenceClassification.from_pretrained(transformer_model_dir)
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        self.model.to(self.device)
        self.model.eval()

        # ---- Load Sentiment Model ----
        logger.info(f"🔹 Loading Sentiment model: {sent_model_path}")
        self.sent_model = load_pickle(sent_model_path)
        self.sent_vec = load_pickle(sent_vec_path)

        logger.info("✅ MetaModelPredictor initialized successfully.")

    # --------------------------
    # Sentiment prediction (TF-IDF Logistic Regression)
    # --------------------------
    def _predict_sentiment(self, texts: List[str]):
        if not texts:
            return []
        sent_feats = self.sent_vec.transform(texts)
        preds = list(self.sent_model.predict(sent_feats))
        return preds

    # --------------------------
    # Mental health transformer prediction
    # --------------------------
    def _predict_mental_health(self, texts: List[str]):
        if not texts:
            return []
        all_preds = []
        batch_size = 8
        with torch.no_grad():
            for i in range(0, len(texts), batch_size):
                batch = texts[i : i + batch_size]
                enc = self.tokenizer(
                    batch,
                    padding=True,
                    truncation=True,
                    return_tensors="pt",
                    max_length=256,
                )
                enc = {k: v.to(self.device) for k, v in enc.items()}
                outputs = self.model(**enc)
                preds = torch.argmax(outputs.logits, dim=1).cpu().numpy()
                all_preds.extend(preds)
        return all_preds

    # --------------------------
    # Old-style predict() — uses same text for both (backward compatibility)
    # --------------------------
    def predict(self, texts: List[str]):
        """
        Keeps backward compatibility — uses same input for both models.
        Use predict_dual() in production.
        """
        try:
            mh_preds = self._predict_mental_health(texts)
            sent_preds = self._predict_sentiment(texts)
            logger.info(f"🧠 Predicted {len(texts)} samples successfully (single input).")
            return mh_preds, sent_preds
        except Exception as e:
            logger.error(f"❌ Prediction error: {e}")
            raise

    # --------------------------
    # ✅ Dual-input predict() — raw_texts for Transformer, cleaned_texts for Sentiment
    # --------------------------
    def predict_dual(self, raw_texts: List[str], clean_texts: List[str]):
        """
        raw_texts  → used for Transformer (mental health model)
        clean_texts → used for Sentiment (TF-IDF + Logistic Regression)
        """
        try:
            mh_preds = self._predict_mental_health(raw_texts)
            sent_preds = self._predict_sentiment(clean_texts)

            if len(mh_preds) != len(sent_preds):
                logger.warning("⚠ Mismatch in prediction lengths — aligning to shortest length.")
                min_len = min(len(mh_preds), len(sent_preds))
                mh_preds, sent_preds = mh_preds[:min_len], sent_preds[:min_len]

            logger.info(f"✅ Dual prediction successful for {len(mh_preds)} samples.")
            return mh_preds, sent_preds
        except Exception as e:
            logger.error(f"❌ Dual prediction error: {e}")
            raise