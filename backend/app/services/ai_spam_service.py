from app.ai.load_models import LoadModels

class AISpamService:
    def __init__(self):
        self.nb_model = LoadModels.nb_model
        self.tfidf_vectorizer = LoadModels.tfidf_vectorizer

    def _ensure_models_loaded(self):
        if self.nb_model is None or self.tfidf_vectorizer is None:
            self.nb_model, self.tfidf_vectorizer = LoadModels.nb_models()
    
    @classmethod
    def check_domain_nb(cls, email_from: str):
        instance = cls()
        instance._ensure_models_loaded()

        domain = email_from.split('@')[-1]

        X = instance.tfidf_vectorizer.transform([domain])
        prediction: str = instance.nb_model.predict(X)[0]
        print(f"check_domain_nb: {domain} -> {prediction}")
        return prediction #spam/ ham
    