# main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from datetime import datetime
import os
import numpy as np

# Pipeline imports
from components.pipeline import data_preprocessing
import components.pipeline.data_extraction as data_extraction
import components.analysis_plot as analysis_plot
from components.logger import logger
from components import train_test_data

# Firestore
from components.firebase_client import db

# CORS
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Labels
ILLNESS_MAP = {
    0: "Anxiety",
    1: "Bipolar",
    2: "Depression",
    3: "Normal",
    4: "PTSD",
}

# Convert numpy → python native
def to_native(obj):
    if isinstance(obj, dict):
        return {k: to_native(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [to_native(v) for v in obj]
    elif isinstance(obj, np.generic):
        return obj.item()
    else:
        return obj

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MH_MODEL_DIR = os.path.join(BASE_DIR, "models", "fine_tuned_mentalbert")
SENT_MODEL_PATH = os.path.join(BASE_DIR, "models", "sentiment_model", "model.pkl")
SENT_VEC_PATH = os.path.join(BASE_DIR, "models", "sentiment_model", "vectorizer.pkl")

# Load model
predictor = train_test_data.MetaModelPredictor(
    transformer_model_dir=MH_MODEL_DIR,
    sent_model_path=SENT_MODEL_PATH,
    sent_vec_path=SENT_VEC_PATH,
)

# Request schema
class UserRequest(BaseModel):
    user_id: str


# =========================================================
# 🚀 Prediction Endpoint (Reddit + Twitter + Spotify merged)
# =========================================================
@app.post("/predict")
async def predict(req: UserRequest):
    logger.info(f"📩 Received analysis request for user: {req.user_id}")

    # 1️⃣ Extract merged data from all connected sources
    raw_items = data_extraction.extract_all_sources(req.user_id)

    if not raw_items:
        raise HTTPException(status_code=404, detail="No social media data found.")

    # Extract lists
    raw_texts = [item["text"] for item in raw_items]
    timestamps = [item["timestamp"] for item in raw_items]

    # 2️⃣ Preprocess
    clean_texts = data_preprocessing.clean_text_batch_v2(raw_texts)

    # 3️⃣ ML Predictions
    mh_preds, sent_preds = predictor.predict_dual(raw_texts, clean_texts)

    # 4️⃣ Text-level detailed analysis
    text_level_analysis = []
    for raw, clean, mh, sent, ts in zip(raw_texts, clean_texts, mh_preds, sent_preds, timestamps):
        text_level_analysis.append({
            "raw_text": raw,
            "cleaned_text": clean,
            "prediction_value": int(mh),
            "prediction_label": ILLNESS_MAP.get(int(mh), "Unknown"),
            "sentiment": float(sent),
            "timestamp": ts,
        })

    # 5️⃣ Convert timestamps → python datetime for charts
    python_dates = [datetime.fromtimestamp(ts / 1000) for ts in timestamps]

    date_grouped_analysis = analysis_plot.prepare_date_grouped_analysis(
        python_dates, mh_preds, sent_preds
    )

    # 6️⃣ Most probable condition
    mode_label, mode_prob = analysis_plot.calculate_most_probable_illness(
        mh_preds, normal_label=3, threshold=0.4
    )

    most_probable_illness = (
        ILLNESS_MAP.get(int(mode_label), "Normal")
        if isinstance(mode_label, (int, np.integer))
        else str(mode_label)
    )

    # 7️⃣ Save ML results to Firestore
    db.collection("users").document(req.user_id).update({
        "most_probable_condition": most_probable_illness,
        "mode_probability": float(mode_prob) if mode_prob else None,
        "mental_health_preds": [int(v) for v in mh_preds],
        "sentiment_preds": [float(v) for v in sent_preds],
        "recent_text_insights": text_level_analysis,
        "last_analysis_run": datetime.now().isoformat(),
    })

    logger.info(f"✅ Analysis completed & saved for {req.user_id}")

    return to_native({
        "text_level_analysis": text_level_analysis,
        "date_grouped_analysis": date_grouped_analysis,
        "most_probable_illness": most_probable_illness,
        "mode_probability": float(mode_prob) if mode_prob else None,
        "mental_health_preds": [int(v) for v in mh_preds],
        "sentiment_preds": [float(v) for v in sent_preds],
    })
