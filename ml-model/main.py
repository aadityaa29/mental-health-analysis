from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from datetime import datetime
import data_extraction
import data_preprocessing
import train_test_data
import analysis_plot
from components.logger import logger

app = FastAPI()

# Initialize predictor (adjust paths as needed)
predictor = train_test_data.MetaModelPredictor(
    mh_model_path='models/mental_health/best_tfidf_logreg.pkl',
    mh_vec_path='models/mental_health/best_tfidf_vectorizer.pkl',
    sent_model_path='model.pkl',
    sent_vec_path='vectorizer.pkl',
)

class UserRequest(BaseModel):
    user_id: str  # Reddit Username

@app.post("/predict")
async def predict(req: UserRequest):
    logger.info(f"Received prediction request for user_id: {req.user_id}")

    raw_texts = data_extraction.extract_merged_text(req.user_id)
    if not raw_texts:
        logger.warning(f"No extracted data for user_id: {req.user_id}")
        raise HTTPException(status_code=404, detail="No data found or tokens missing.")
    
    clean_texts = data_preprocessing.clean_text_batch(raw_texts)  # assumes returns list

    mh_preds, sent_preds = predictor.predict(clean_texts)

    # Fake same date for all (adjust if you want real timestamps)
    fake_dates = [datetime.now()] * len(clean_texts)

    text_level_analysis = analysis_plot.prepare_text_level_analysis(clean_texts, mh_preds, sent_preds)
    date_grouped_analysis = analysis_plot.prepare_date_grouped_analysis(fake_dates, mh_preds, sent_preds)
    mode_label, mode_prob = analysis_plot.calculate_most_probable_illness(mh_preds, normal_label=5, threshold=0.4)

    return {
        "text_level_analysis": text_level_analysis,
        "date_grouped_analysis": date_grouped_analysis,
        "most_probable_illness": mode_label if mode_label is not None else "Normal",
        "mode_probability": mode_prob,
        "mental_health_preds": mh_preds,
        "sentiment_preds": sent_preds,
    }
