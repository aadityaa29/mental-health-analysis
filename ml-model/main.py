from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from datetime import datetime
from firebase_admin import credentials, firestore
import firebase_admin
import numpy as np

# Local imports
from components.pipeline import data_preprocessing, config
from components.pipeline.data_extraction_master import extract_all_platform_data
from components import train_test_data, analysis_plot
from components.logger import logger

# ========================
# 🚀 Initialize FastAPI App
# ========================
app = FastAPI(title="Mental Health Analysis API")

# ✅ Enable CORS for frontend (Next.js)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://neura-sense.web.app",
        "https://neura-sense.netlify.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========================
# 🔥 Firebase Initialization
# ========================
if not firebase_admin._apps:
    try:
        if config.FIREBASE_SERVICE_ACCOUNT_PATH:
            cred = credentials.Certificate(config.FIREBASE_SERVICE_ACCOUNT_PATH)
            firebase_admin.initialize_app(cred, {"databaseURL": config.FIREBASE_DB_URL})
            print("✅ Firebase Admin initialized successfully.")
        else:
            print("⚠️ Missing FIREBASE_SERVICE_ACCOUNT_PATH in .env")
    except Exception as e:
        print(f"🚨 Firebase init error: {e}")

# ========================
# 🧠 Load ML Models
# ========================
predictor = train_test_data.MetaModelPredictor(
    mh_model_path="models/mental_health/best_tfidf_logreg.pkl",
    mh_vec_path="models/mental_health/best_tfidf_vectorizer.pkl",
    sent_model_path="models/sentiment_model/model.pkl",
    sent_vec_path="models/sentiment_model/vectorizer.pkl",
)

# ========================
# 🧾 API Request Schema
# ========================
class UserRequest(BaseModel):
    uid: str  # Firebase User ID


# ========================
# 🔮 Prediction Endpoint
# ========================
@app.post("/predict")
async def predict(req: UserRequest):
    logger.info(f"🟢 Received prediction request for UID: {req.uid}")

    try:
        db = firestore.client()

        # Step 1️⃣: Fetch connected platform tokens
        tokens_ref = db.collection("users").document(req.uid).collection("tokens")
        tokens = {}

        for platform in ["reddit", "twitter", "spotify"]:
            doc = tokens_ref.document(platform).get()
            if doc.exists:
                tokens[platform] = doc.to_dict()

        if not tokens:
            raise HTTPException(status_code=404, detail="No connected platforms found for this user.")

        logger.info(f"🔗 Connected platforms for {req.uid}: {list(tokens.keys())}")

        # Step 2️⃣: Extract user activity from all connected platforms
        raw_texts = extract_all_platform_data(tokens)
        if not raw_texts:
            raise HTTPException(status_code=404, detail="No user activity found to analyze.")

        logger.info(f"📄 Extracted {len(raw_texts)} text samples for {req.uid}")

        # Step 3️⃣: Preprocess the text data
        clean_texts = data_preprocessing.clean_text_batch(raw_texts)

        # Step 4️⃣: Run ML predictions
        mh_preds, sent_preds = predictor.predict(clean_texts)

        # Step 5️⃣: Generate dummy timestamps for now
        fake_dates = [datetime.now()] * len(clean_texts)

        # Step 6️⃣: Generate analytical summaries
        text_level_analysis = analysis_plot.prepare_text_level_analysis(clean_texts, mh_preds, sent_preds)
        date_grouped_analysis = analysis_plot.prepare_date_grouped_analysis(fake_dates, mh_preds, sent_preds)
        mode_label, mode_prob = analysis_plot.calculate_most_probable_illness(
            mh_preds, normal_label=5, threshold=0.4
        )

        # Step 7️⃣: Convert NumPy -> native Python types
        def to_native(val):
            if isinstance(val, np.generic):
                return val.item()
            elif isinstance(val, np.ndarray):
                return val.tolist()
            return val

        # Step 8️⃣: Build final response JSON
        response_data = {
            "user_id": req.uid,
            "connected_platforms": list(tokens.keys()),
            "most_probable_illness": str(mode_label) if mode_label else "Normal",
            "mode_probability": float(mode_prob),
            "mental_health_preds": [to_native(x) for x in mh_preds],
            "sentiment_preds": [to_native(x) for x in sent_preds],
            "text_level_analysis": [
                {
                    "text": t,
                    "mental_health_pred": to_native(mh),
                    "sentiment_pred": to_native(sp),
                }
                for t, mh, sp in zip(clean_texts, mh_preds, sent_preds)
            ],
            "date_grouped_analysis": [
                {
                    "date": str(entry["date"]),
                    "mental_health_mode": to_native(entry["mental_health_mode"]),
                    "mental_health_count": to_native(entry["mental_health_count"]),
                    "sentiment_avg": float(entry["sentiment_avg"]),
                }
                for entry in date_grouped_analysis
            ],
        }

        logger.info(f"✅ Prediction successfully generated for {req.uid}")
        return JSONResponse(content=response_data)

    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"❌ Error in /predict: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ========================
# 🏠 Health Check
# ========================
@app.get("/")
def root():
    return {"status": "✅ Backend running", "endpoint": "/predict"}
