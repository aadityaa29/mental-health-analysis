import pandas as pd
import joblib
import pickle
import re
import nltk
from nltk.corpus import stopwords
from sklearn.metrics import accuracy_score, classification_report
from components.pipeline import data_preprocessing

# ========================
# 🧠 Setup NLTK
# ========================
nltk.download("punkt", quiet=True)
nltk.download("stopwords", quiet=True)

STOPWORDS = set(stopwords.words("english"))

# ========================
# 📂 Model Paths
# ========================
mh_model_path = "models/mental_health/best_tfidf_logreg.pkl"
mh_vectorizer_path = "models/mental_health/best_tfidf_vectorizer.pkl"
sent_model_path = "models/sentiment_model/model.pkl"
sent_vectorizer_path = "models/sentiment_model/vectorizer.pkl"

# ========================
# ⚙️ Safe Model Loader
# ========================
def load_model(path):
    try:
        return pickle.load(open(path, "rb"))
    except Exception:
        print(f"⚠️ Pickle failed for {path}, trying joblib...")
        return joblib.load(path)

# ========================
# 🧹 Simple Cleaner (for sentiment)
# ========================
def clean_text(text: str) -> str:
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = re.sub(r"http\S+|www\.\S+", " ", text)
    text = re.sub(r"@\w+", " ", text)
    text = re.sub(r"[^a-z\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    tokens = text.split()
    return " ".join([w for w in tokens if w not in STOPWORDS])

def clean_text_batch(texts):
    return [clean_text(t) for t in texts]

# ========================
# 📊 Evaluation Function
# ========================
def evaluate_model(model_path, vec_path, data_path, text_col, label_col, use_advanced_clean=False):
    print("\n" + "="*70)
    print(f"🧠 Evaluating: {model_path}")
    print("="*70)

    model = load_model(model_path)
    vectorizer = load_model(vec_path)

    # --- Load Dataset ---
    df = pd.read_csv(data_path)
    if text_col not in df.columns or label_col not in df.columns:
        print("⚠️ Missing required columns.")
        print("➡️ Columns found:", df.columns.tolist())
        return

    texts = df[text_col].astype(str).tolist()
    labels = df[label_col].astype(int).tolist()

    # --- Preprocess Text ---
    if use_advanced_clean:
        X = data_preprocessing.clean_text_batch_v2(texts)
    else:
        X = clean_text_batch(texts)

    # --- Vectorize ---
    if hasattr(model, "named_steps"):  # if pipeline
        print("📦 Detected sklearn Pipeline — feeding raw text directly.")
        y_pred = model.predict(X)
    else:
        X_vec = vectorizer.transform(X)
        y_pred = model.predict(X_vec)

    # --- Evaluate ---
    acc = accuracy_score(labels, y_pred)
    print(f"✅ Accuracy: {acc*100:.2f}%")
    print("\n📈 Classification Report:\n")
    print(classification_report(labels, y_pred, digits=3))


# ========================
# 🚀 Run Evaluations
# ========================
# 🧠 Mental Health Model
evaluate_model(
    mh_model_path,
    mh_vectorizer_path,
    data_path="notebooks/data/cleaned_data_after_posion.csv",
    text_col="clean_text",
    label_col="target",
    use_advanced_clean=True
)

# ❤️ Sentiment Model
evaluate_model(
    sent_model_path,
    sent_vectorizer_path,
    data_path="notebooks/data/train_tweet.csv",
    text_col="tweet",
    label_col="label",
    use_advanced_clean=False
)
