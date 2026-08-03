import requests
import json
import os

BASE_URL = "http://127.0.0.1:8000/Agri/api"

def test_crop_prediction():
    print("\n--- 1. Testing Crop Recommendation Model ---")
    url = f"{BASE_URL}/predict/crop/"
    payload = {
        "N": 90,
        "P": 42,
        "K": 43,
        "temperature": 20.87,
        "humidity": 82.00,
        "ph": 6.50,
        "rainfall": 202.94
    }
    try:
        response = requests.post(url, json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Failed to connect to API ({e}). Make sure 'python manage.py runserver' is running.")

def test_fertilizer_prediction():
    print("\n--- 2. Testing Fertilizer Recommendation Model ---")
    url = f"{BASE_URL}/predict/fertilizer/"
    payload = {
        "N": 37,
        "P": 0,
        "K": 0,
        "T": 26,
        "Hum": 52,
        "Moisture": 38,
        "Soil_Type": "Loamy",  # Options: Black, Clayey, Loamy, Red, Sandy
        "Crop_Type": "Maize"   # Options: Maize, Sugarcane, Cotton, Tobacco, Paddy, Barley, Wheat, etc.
    }
    try:
        response = requests.post(url, json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Failed to connect to API ({e}). Make sure 'python manage.py runserver' is running.")

def test_disease_prediction():
    print("\n--- 3. Testing Plant Disease Detection Model ---")
    url = f"{BASE_URL}/predict/disease/"
    image_path = "dummy.jpg"
    
    if not os.path.exists(image_path):
        print(f"Image file '{image_path}' not found. Creating a test dummy image...")
        from PIL import Image
        import numpy as np
        img = Image.fromarray(np.zeros((128, 128, 3), dtype=np.uint8))
        img.save(image_path)

    try:
        with open(image_path, 'rb') as img_file:
            files = {'image': img_file}
            response = requests.post(url, files=files)
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Failed to connect to API ({e}). Make sure 'python manage.py runserver' is running.")

if __name__ == "__main__":
    print("🌾 Agrismart AI — 3 Models API Test Script")
    test_crop_prediction()
    test_fertilizer_prediction()
    test_disease_prediction()
