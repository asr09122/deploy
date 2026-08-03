import joblib
try:
    model = joblib.load('Agrismart/models/plant_disease_model.pkl')
    print("Input shape:", model.input_shape)
    print("Output shape:", model.output_shape)
except Exception as e:
    print("Error:", e)
