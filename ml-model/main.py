# main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from datetime import datetime
import numpy as np
from components.pipeline import data_preprocessing as data_preprocessing
from components import train_test_data as train_test_data
import components.pipeline.data_extraction as data_extraction
import components.analysis_plot as analysis_plot
from components.logger import logger

app = FastAPI()

ILLNESS_MAP = {
    0: "Depression",
    1: "Anxiety",
    2: "PTSD",
    3: "OCD",
    4: "Bipolar",
    5: "Normal",
}

def to_native(obj):
    if isinstance(obj, dict):
        return {k: to_native(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [to_native(v) for v in obj]
    elif isinstance(obj, np.generic):
        return obj.item()
    else:
        return obj

# --- Configure paths to your v3 artifacts ---
BASE = "models/mental_health_v3"
TFIDF_PATH = f"{BASE}/tfidf_vectorizer.pkl"
SCALER_PATH = f"{BASE}/scaler.pkl"
FINAL_MODEL_PATH = f"{BASE}/final_hybrid_model.pkl"

# sentiment model (optional)
SENT_MODEL_PATH = "models/sentiment_model/model.pkl"
SENT_VEC_PATH = "models/sentiment_model/vectorizer.pkl"

# initialize predictor (this will load TF-IDF, scaler and final hybrid model)
predictor = train_test_data.MetaModelPredictor(
    final_model_path="models/mental_health_v3/final_hybrid_model.pkl",
    tfidf_path="models/mental_health_v3/tfidf_vectorizer.pkl",
    scaler_path="models/mental_health_v3/scaler.pkl",
    sent_model_path="models/sentiment_model/model.pkl",
    sent_vec_path="models/sentiment_model/vectorizer.pkl",
    sbert_model_name="all-MiniLM-L6-v2",
)


class UserRequest(BaseModel):
    user_id: str

@app.post("/predict")
async def predict(req: UserRequest):
    logger.info(f"📩 Received request for user_id: {req.user_id}")

    # Step 1: Extract user text
    raw_texts = data_extraction.extract_merged_text(req.user_id)
    if not raw_texts:
        logger.warning(f"No data found for user_id: {req.user_id}")
        raise HTTPException(status_code=404, detail="No user data found.")

    # Step 2: Clean text (same as during training)
    clean_texts = data_preprocessing.clean_text_batch_v2(raw_texts)
    if not clean_texts:
        raise HTTPException(status_code=400, detail="No valid text after preprocessing.")

    # Step 3: Run predictions safely
    try:
        mh_preds, sent_preds = predictor.predict(clean_texts)
    except Exception as e:
        import traceback
        logger.error(f"❌ Prediction failed: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

    # Step 4: Fake timestamps (can be replaced with actual Reddit post dates)
    fake_dates = [datetime.now()] * len(clean_texts)

    # Step 5: Generate analysis
    text_level_analysis = analysis_plot.prepare_text_level_analysis(clean_texts, mh_preds, sent_preds)
    date_grouped_analysis = analysis_plot.prepare_date_grouped_analysis(fake_dates, mh_preds, sent_preds)
    mode_label, mode_prob = analysis_plot.calculate_most_probable_illness(
        mh_preds, normal_label=5, threshold=0.4
    )

    # ✅ Safe illness label resolution
    if isinstance(mode_label, (int, np.integer)):
        most_probable_illness = ILLNESS_MAP.get(int(mode_label), "Normal")
    elif isinstance(mode_label, str) and mode_label.isdigit():
        most_probable_illness = ILLNESS_MAP.get(int(mode_label), "Normal")
    else:
        most_probable_illness = str(mode_label or "Normal")

    # Step 6: Construct JSON-safe response
    response = {
        "text_level_analysis": [
            {
                "text": t,
                "mental_health_pred": ILLNESS_MAP.get(int(mh), "Unknown"),
                "sentiment_pred": float(sp),
            }
            for t, mh, sp in zip(clean_texts, mh_preds, sent_preds)
        ],
        "date_grouped_analysis": date_grouped_analysis,
        "most_probable_illness": most_probable_illness,
        "mode_probability": float(mode_prob) if mode_prob is not None else None,
        "mental_health_preds": [int(x) for x in mh_preds],
        "sentiment_preds": [int(x) for x in sent_preds],
    }

    logger.info(f"✅ Prediction complete for user_id: {req.user_id}")
    return to_native(response)
