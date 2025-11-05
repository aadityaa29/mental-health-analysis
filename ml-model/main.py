from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

import data_extraction
import data_preprocessing
import train_test_data
import analysis_plot
from components.logger import logger

app = FastAPI()

# Initialize MetaModelPredictor with model/vectorizer paths (adjust your actual paths)
predictor = train_test_data.MetaModelPredictor(
    mh_model_path='model1.pkl',
    mh_vec_path='vectorizer1.pkl',
    sent_model_path='model2.pkl',
    sent_vec_path='vectorizer2.pkl',
)

class UserRequest(BaseModel):
    user_id: str  # Reddit Username or Firebase user ID linked to tokens

@app.post("/predict")
async def predict(req: UserRequest):
    logger.info(f"Received prediction request for user_id: {req.user_id}")

    # Step 1: Extract merged text(s) from Reddit user posts/comments
    raw_texts = data_extraction.extract_merged_text(req.user_id)
    if not raw_texts:
        logger.warning(f"No extracted data for user_id: {req.user_id}")
        raise HTTPException(status_code=404, detail="No data found or tokens missing.")

    # Step 2: Preprocess texts
    clean_texts = data_preprocessing.clean_text_batch(raw_texts)

    # Step 3: Get model predictions (mental health and sentiment)
    mh_preds, sent_preds = predictor.predict(clean_texts)

    # Step 4: For analysis, generate some fake datetime list if not tracked (here assume today's date)
    # Ideally your extraction returns dates - adjust accordingly.
    fake_dates = [datetime.now()] * len(clean_texts)

    # Step 5: Prepare JSON-serializable analysis data
    text_level_analysis = analysis_plot.prepare_text_level_analysis(clean_texts, mh_preds, sent_preds)
    date_grouped_analysis = analysis_plot.prepare_date_grouped_analysis(fake_dates, mh_preds, sent_preds)
    mode_label, mode_prob = analysis_plot.calculate_most_probable_illness(mh_preds, normal_label=5, threshold=0.4)

    response = {
        "text_level_analysis": text_level_analysis,
        "date_grouped_analysis": date_grouped_analysis,
        "most_probable_illness": mode_label if mode_label is not None else "Normal",
        "mode_probability": mode_prob,
        "mental_health_preds": mh_preds,
        "sentiment_preds": sent_preds.tolist() if hasattr(sent_preds, 'tolist') else sent_preds
    }
    logger.info(f"Returning prediction response for user_id: {req.user_id}")
    return response
