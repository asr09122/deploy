import joblib
try:
    model = joblib.load('Agrismart/models/plant_disease_model.pkl')
    print("Type of model:", type(model))
except Exception as e:
    print("Error loading:", e)
