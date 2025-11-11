# main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from datetime import datetime
import numpy as np
import components.pipeline.data_extraction as data_extraction
import components.pipeline.data_preprocessing as data_preprocessing
import components.train_test_data as train_test_data
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

# ✅ Load predictor (no scaler used)
predictor = train_test_data.MetaModelPredictor(
    mh_model_path='models/mental_health_v2/final_lightgbm.pkl',
    mh_vec_path='models/mental_health_v2/tfidf_vectorizer.pkl',
    base_lr_path='models/mental_health_v2/base_lr_tfidf.pkl',
    sent_model_path='models/sentiment_model/model.pkl',
    sent_vec_path='models/sentiment_model/vectorizer.pkl',
)

class UserRequest(BaseModel):
    user_id: str

@app.post("/predict")
async def predict(req: UserRequest):
    logger.info(f"Received request for user_id: {req.user_id}")

    raw_texts = data_extraction.extract_merged_text(req.user_id)
    if not raw_texts:
        raise HTTPException(status_code=404, detail="No user data found.")

    # Consistent preprocessing (same as training)
    clean_texts = data_preprocessing.clean_text_batch_v2(raw_texts)

    # Run model predictions
    mh_preds, sent_preds = predictor.predict(clean_texts)

    # Generate fake dates for grouping
    fake_dates = [datetime.now()] * len(clean_texts)

    text_level_analysis = analysis_plot.prepare_text_level_analysis(clean_texts, mh_preds, sent_preds)
    date_grouped_analysis = analysis_plot.prepare_date_grouped_analysis(fake_dates, mh_preds, sent_preds)
    mode_label, mode_prob = analysis_plot.calculate_most_probable_illness(mh_preds, normal_label=5, threshold=0.4)

    return to_native({
        "text_level_analysis": [
            {
                "text": t,
                "mental_health_pred": ILLNESS_MAP.get(int(mh), "Unknown"),
                "sentiment_pred": float(sp),
            }
            for t, mh, sp in zip(clean_texts, mh_preds, sent_preds)
        ],
        "date_grouped_analysis": date_grouped_analysis,
        "most_probable_illness": ILLNESS_MAP.get(int(mode_label), "Normal") if mode_label is not None else "Normal",
        "mode_probability": float(mode_prob) if mode_prob is not None else None,
        "mental_health_preds": [int(x) for x in mh_preds],
        "sentiment_preds": [int(x) for x in sent_preds],
    })
