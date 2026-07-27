import joblib
from pathlib import Path

class LoadModels:
    nb_model = None
    tfidf_vectorizer = None

    @staticmethod
    def nb_models():
        base_dir = Path(__file__).resolve().parent
        model_dir = base_dir / "NB_model"

        LoadModels.nb_model = joblib.load(model_dir / "nb_model.pkl")
        LoadModels.tfidf_vectorizer = joblib.load(model_dir / "tfidf_vectorizer.pkl")

        return LoadModels.nb_model, LoadModels.tfidf_vectorizer