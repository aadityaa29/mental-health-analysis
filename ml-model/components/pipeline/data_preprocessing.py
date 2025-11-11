# components/pipeline/data_preprocessing.py
# -------------------------------------------------------------
# Text cleaning & preprocessing (consistent with training)
# -------------------------------------------------------------

import re
import os
import ssl
import nltk
from nltk.corpus import stopwords, wordnet
from nltk.stem import WordNetLemmatizer
from nltk import pos_tag, word_tokenize

# Custom NLTK data dir
NLTK_DIR = os.path.expanduser("~/nltk_new_data")
os.makedirs(NLTK_DIR, exist_ok=True)
nltk.data.path.append(NLTK_DIR)

# macOS SSL fix
try:
    ssl._create_default_https_context = ssl._create_unverified_context
except Exception:
    pass

# Ensure corpora
for pkg in ["stopwords", "punkt", "averaged_perceptron_tagger", "wordnet"]:
    try:
        nltk.data.find(f"corpora/{pkg}")
    except LookupError:
        print(f"📦 Downloading missing: {pkg}")
        nltk.download(pkg, download_dir=NLTK_DIR, quiet=True)

stop_words = set(stopwords.words("english"))
lem = WordNetLemmatizer()

# --- Basic cleaner (for sentiment model) ---
def clean_text(text: str) -> str:
    text = text.lower()
    text = re.sub(r"http\S+|www\.\S+", " ", text)
    text = re.sub(r"@\w+", " ", text)
    text = re.sub(r"[^a-z\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    tokens = text.split()
    return " ".join([w for w in tokens if w not in stop_words])

def clean_text_batch(texts):
    return [clean_text(t) for t in texts]

# --- Advanced cleaner (for MH model) ---
def _advanced_clean(text):
    text = text.lower()
    text = re.sub(r"http\S+|www\.\S+", " ", text)
    text = re.sub(r"@\w+", " ", text)
    text = re.sub(r"[^a-z\s']", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    tokens = word_tokenize(text)
    pos_tags = pos_tag(tokens)
    cleaned = []
    for word, tag in pos_tags:
        if word in stop_words:
            continue
        pos = (
            wordnet.VERB if tag.startswith("V")
            else wordnet.NOUN if tag.startswith("N")
            else wordnet.ADJ if tag.startswith("J")
            else wordnet.ADV
        )
        cleaned.append(lem.lemmatize(word, pos))
    return " ".join(cleaned)

def clean_text_batch_v2(texts):
    return [_advanced_clean(t) for t in texts]
