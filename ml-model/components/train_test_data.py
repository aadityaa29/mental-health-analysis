import joblib
import logging
from typing import List

logger = logging.getLogger("train_test")

def load_pickle(path: str):
    try:
        obj = joblib.load(path)
        logger.info(f"✅ Loaded model/vectorizer using joblib from {path}")
        return obj
    except Exception as e:
        logger.error(f"❌ Failed to load file {path}: {e}")
        raise e


class MetaModelPredictor:
    def __init__(self, mh_model_path, mh_vec_path, sent_model_path, sent_vec_path):
        self.mh_model = load_pickle(mh_model_path)
        self.mh_vec = load_pickle(mh_vec_path)
        self.sent_model = load_pickle(sent_model_path)
        self.sent_vec = load_pickle(sent_vec_path)

    def predict(self, texts: List[str]):
        try:
            # Sentiment prediction (vectorizer + model separate)
            sent_features = self.sent_vec.transform(texts)
            sent_preds = self.sent_model.predict(sent_features)

            mh_preds = []
            for i, text in enumerate(texts):
                if sent_preds[i] == 0:  # Negative sentiment
                    # ✅ Directly predict from model (if pipeline)
                    try:
                        pred = self.mh_model.predict([text])[0]
                    except Exception:
                        # fallback: if not pipeline
                        mh_features = self.mh_vec.transform([text])
                        pred = self.mh_model.predict(mh_features)[0]
                else:
                    pred = 5  # Normal
                mh_preds.append(pred)

            logger.info(f"✅ Predicted {len(texts)} samples successfully.")
            return mh_preds, sent_preds

        except Exception as e:
            logger.error(f"🚨 Prediction error: {e}")
            raise e
