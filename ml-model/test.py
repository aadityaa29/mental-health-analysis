from lightgbm import LGBMClassifier
import joblib

# load the old pickle once safely
import pickle
with open("models/mental_health_v2/final_lightgbm.pkl", "rb") as f:
    model = pickle.load(f)

# re-save in your new environment
joblib.dump(model, "models/mental_health_v2/final_lightgbm_re.pkl")
