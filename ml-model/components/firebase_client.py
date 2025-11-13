import firebase_admin
from firebase_admin import credentials, firestore
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SERVICE_FILE = os.path.join(os.path.dirname(BASE_DIR), "serviceAccountKey.json")

# Initialize Firebase App (Singleton)
if not firebase_admin._apps:
    cred = credentials.Certificate(SERVICE_FILE)
    firebase_admin.initialize_app(cred)

db = firestore.client()
