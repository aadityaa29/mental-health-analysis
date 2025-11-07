import pandas as pd
import joblib
import pickle
from sklearn.metrics import accuracy_score, classification_report
from components.pipeline import data_preprocessing

# ========================
# 🧠 Paths to Models
# ========================
mh_model_path = "models/mental_health/best_tfidf_logreg.pkl"
mh_vectorizer_path = "models/mental_health/best_tfidf_vectorizer.pkl"
sent_model_path = "models/sentiment_model/model.pkl"
sent_vectorizer_path = "models/sentiment_model/vectorizer.pkl"

# ========================
# 🧩 Load Models (Auto-Detect)
# ========================
def load_model(path):
    try:
        return pickle.load(open(path, "rb"))
    except Exception:
        print(f"⚠️ Pickle failed for {path}, trying joblib...")
        return joblib.load(path)

# ========================
# 📊 Evaluate Function
# ========================
def evaluate_model(model_path, vec_path, data_path, text_col="tweet", label_col="label"):
    print("\n" + "="*70)
    print(f"🧠 Evaluating: {model_path}")
    print("="*70)

    model = load_model(model_path)
    vectorizer = load_model(vec_path)

    df = pd.read_csv(data_path)
    if text_col not in df.columns or label_col not in df.columns:
        print("⚠️ Missing 'tweet' or 'label' columns in dataset.")
        print("➡️ Columns found:", df.columns.tolist())
        return

    # ✅ Clean text and prepare data
    X = data_preprocessing.clean_text_batch(df[text_col].tolist())
    y_true = df[label_col].tolist()

    # ✅ Auto-handle pipeline vs plain model
    if hasattr(model, "named_steps"):  # model is a pipeline
        print("📦 Detected pipeline model — feeding raw text directly.")
        y_pred = model.predict(X)
    else:  # model needs external vectorizer
        X_vec = vectorizer.transform(X)
        y_pred = model.predict(X_vec)

    # ✅ Calculate and display metrics
    acc = accuracy_score(y_true, y_pred)
    print(f"✅ Accuracy: {acc*100:.2f}%")
    print("\nClassification Report:\n", classification_report(y_true, y_pred))


# ========================
# 🚀 Run Evaluations
# ========================
evaluate_model(mh_model_path, mh_vectorizer_path, "notebooks/data/train_tweet.csv")
evaluate_model(sent_model_path, sent_vectorizer_path, "notebooks/data/train_tweet.csv")
