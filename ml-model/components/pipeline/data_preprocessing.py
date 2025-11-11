# components/pipeline/data_preprocessing.py
"""
Text cleaning & preprocessing — matches training pipeline.
Uses local NLTK dir: ~/nltk_new_data
"""

import os
import ssl
import re
import nltk
from nltk.corpus import stopwords, wordnet
from nltk.stem import WordNetLemmatizer
from nltk import pos_tag, word_tokenize

# Ensure local nltk folder is used (you already created it previously)
NLTK_DIR = os.path.expanduser("~/nltk_new_data")
os.makedirs(NLTK_DIR, exist_ok=True)
nltk.data.path.append(NLTK_DIR)

# macOS SSL fix for downloader (safe no-op if not needed)
try:
    ssl._create_default_https_context = ssl._create_unverified_context
except Exception:
    pass

# Ensure required corpora are present (quiet)
REQUIRED = ["stopwords", "punkt", "averaged_perceptron_tagger", "wordnet"]
for pkg in REQUIRED:
    try:
        # punkt lives under tokenizers; others under corpora or taggers
        if pkg == "punkt":
            nltk.data.find(f"tokenizers/{pkg}")
        elif pkg == "averaged_perceptron_tagger":
            nltk.data.find(f"taggers/{pkg}")
        else:
            nltk.data.find(f"corpora/{pkg}")
    except LookupError:
        nltk.download(pkg, download_dir=NLTK_DIR, quiet=True)

STOP_WORDS = set(stopwords.words("english"))
LEM = WordNetLemmatizer()

def basic_clean(text: str) -> str:
    """Light cleaning used for sentiment pipeline."""
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = re.sub(r"http\S+|www\.\S+", " ", text)
    text = re.sub(r"@\w+", " ", text)
    text = re.sub(r"[^a-z\s]", " ", text)   # only letters + spaces
    text = re.sub(r"\s+", " ", text).strip()
    return text

def clean_text(text: str) -> str:
    """Used for sentiment model (keeps simple tokens, removes stopwords)."""
    text = basic_clean(text)
    tokens = text.split()
    filtered = [t for t in tokens if t not in STOP_WORDS]
    return " ".join(filtered)

def clean_text_batch(texts):
    return [clean_text(t) for t in texts]

def advanced_clean(text: str) -> str:
    """Advanced cleaning used for MH model: tokenization, POS-based lemmatization."""
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = re.sub(r"http\S+|www\.\S+", " ", text)
    text = re.sub(r"@\w+", " ", text)
    text = re.sub(r"[^a-z\s']", " ", text)   # keep apostrophes (if you need)
    text = re.sub(r"\s+", " ", text).strip()

    tokens = word_tokenize(text)
    tags = pos_tag(tokens)

    out = []
    for w, tag in tags:
        if w in STOP_WORDS:
            continue
        # map tag to wordnet pos
        if tag.startswith("V"):
            p = wordnet.VERB
        elif tag.startswith("N"):
            p = wordnet.NOUN
        elif tag.startswith("J"):
            p = wordnet.ADJ
        else:
            p = wordnet.ADV
        out.append(LEM.lemmatize(w, p))

    return " ".join(out)

def clean_text_batch_v2(texts):
    return [advanced_clean(t) for t in texts]
