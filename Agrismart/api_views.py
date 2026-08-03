"""
Agrismart REST API Views — JSON endpoints for the separated frontend
"""
import json
import joblib
import numpy as np
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.conf import settings
from PIL import Image
import io

def success(data, status=200):
    return JsonResponse({"success": True, "data": data}, status=status)

def error(msg, status=400):
    return JsonResponse({"success": False, "error": msg}, status=status)

DISEASE_CLASSES = ['Apple - Apple scab', 'Apple - Black rot', 'Apple - Cedar apple rust', 'Apple - healthy', 'Blueberry - healthy', 'Cherry (including sour) - Powdery mildew', 'Cherry (including sour) - healthy', 'Corn (maize) - Cercospora leaf spot Gray leaf spot', 'Corn (maize) - Common rust', 'Corn (maize) - Northern Leaf Blight', 'Corn (maize) - healthy', 'Grape - Black rot', 'Grape - Esca (Black Measles)', 'Grape - Leaf blight (Isariopsis Leaf Spot)', 'Grape - healthy', 'Orange - Haunglongbing (Citrus greening)', 'Peach - Bacterial spot', 'Peach - healthy', 'Pepper, bell - Bacterial spot', 'Pepper, bell - healthy', 'Potato - Early blight', 'Potato - Late blight', 'Potato - healthy', 'Raspberry - healthy', 'Soybean - healthy', 'Squash - Powdery mildew', 'Strawberry - Leaf scorch', 'Strawberry - healthy', 'Tomato - Bacterial spot', 'Tomato - Early blight', 'Tomato - Late blight', 'Tomato - Leaf Mold', 'Tomato - Septoria leaf spot', 'Tomato - Spider mites Two-spotted spider mite', 'Tomato - Target Spot', 'Tomato - Tomato Yellow Leaf Curl Virus', 'Tomato - Tomato mosaic virus', 'Tomato - healthy']


# ── Auth ─────────────────────────────────────
@csrf_exempt
@require_http_methods(["POST"])
def api_login(request):
    try:
        body = json.loads(request.body)
    except json.JSONDecodeError:
        return error("Invalid JSON")
    user = authenticate(request, username=body.get("username",""), password=body.get("password",""))
    if user:
        login(request, user)
        return success({"username": user.username, "email": user.email})
    return error("Invalid credentials", 401)


@csrf_exempt
@require_http_methods(["POST"])
def api_logout(request):
    logout(request)
    return success({"message": "Logged out"})


@csrf_exempt
@require_http_methods(["POST"])
def api_register(request):
    try:
        body = json.loads(request.body)
        username = body.get("username","").strip()
        email    = body.get("email","").strip()
        password = body.get("password","")
    except json.JSONDecodeError:
        return error("Invalid JSON")

    if not all([username, email, password]):
        return error("username, email and password required")
    if User.objects.filter(username=username).exists():
        return error("Username already taken")
    if User.objects.filter(email=email).exists():
        return error("Email already registered")
    if len(password) < 8:
        return error("Password must be at least 8 characters")

    user = User.objects.create_user(username=username, email=email, password=password)
    return success({"username": user.username, "email": user.email}, 201)


@require_http_methods(["GET"])
def api_me(request):
    if request.user.is_authenticated:
        return success({"username": request.user.username, "email": request.user.email})
    return error("Not authenticated", 401)


# ── Model Caching ─────────────────────────────
_CROP_MODEL = None
_CROP_SCALER = None
_CROP_LE = None

_FERT_MODEL = None
_FERT_SCALER = None
_FERT_LE = None

_DISEASE_MODEL = None

def get_crop_models():
    global _CROP_MODEL, _CROP_SCALER, _CROP_LE
    if _CROP_MODEL is None:
        _CROP_MODEL  = joblib.load("Agrismart/models/random_forest_model.pkl")
        _CROP_SCALER = joblib.load("Agrismart/models/scaler1.pkl")
        _CROP_LE     = joblib.load("Agrismart/models/crop.pkl")
    return _CROP_MODEL, _CROP_SCALER, _CROP_LE

def get_fert_models():
    global _FERT_MODEL, _FERT_SCALER, _FERT_LE
    if _FERT_MODEL is None:
        _FERT_MODEL  = joblib.load("Agrismart/models/random_forest_fertilizer_model.pkl")
        _FERT_SCALER = joblib.load("Agrismart/models/scaler.pkl")
        _FERT_LE     = joblib.load("Agrismart/models/le_fertilizer.pkl")
    return _FERT_MODEL, _FERT_SCALER, _FERT_LE

def get_disease_model():
    global _DISEASE_MODEL
    if _DISEASE_MODEL is None:
        _DISEASE_MODEL = joblib.load("Agrismart/models/plant_disease_model.pkl")
    return _DISEASE_MODEL


# ── Crop Prediction ───────────────────────────
@csrf_exempt
@require_http_methods(["POST"])
def api_predict_crop(request):
    try:
        body = json.loads(request.body)
        features = np.array([[
            float(body["N"]), float(body["P"]), float(body["K"]),
            float(body["temperature"]), float(body["humidity"]),
            float(body["ph"]), float(body["rainfall"])
        ]])
    except (json.JSONDecodeError, KeyError, ValueError, TypeError) as e:
        return error(f"Invalid input: {e}")

    try:
        model, scaler, le_crop = get_crop_models()
        pred    = model.predict(scaler.transform(features))
        label   = le_crop.inverse_transform([int(pred[0])])[0]
        return success({"crop": label})
    except Exception as e:
        return error(f"Prediction failed: {e}", 500)


# ── Fertilizer Prediction ─────────────────────
SOIL_MAP = {"Black": 0, "Clayey": 1, "Loamy": 2, "Red": 3, "Sandy": 4}
CROP_MAP = {
    "Barley": 0, "Cotton": 1, "Ground Nuts": 2, "Maize": 3,
    "Millets": 4, "Oil seeds": 5, "Paddy": 6, "Pulses": 7,
    "Sugarcane": 8, "Tobacco": 9, "Wheat": 10
}

@csrf_exempt
@require_http_methods(["POST"])
def api_predict_fertilizer(request):
    try:
        body = json.loads(request.body)
        st_raw = body["Soil_Type"]
        ct_raw = body["Crop_Type"]
        Soil_Type = int(st_raw) if str(st_raw).isdigit() else SOIL_MAP.get(st_raw, -1)
        Crop_Type = int(ct_raw) if str(ct_raw).isdigit() else CROP_MAP.get(ct_raw, -1)
        if Soil_Type < 0 or Crop_Type < 0:
            return error("Invalid Soil_Type or Crop_Type")
        features = np.array([[
            float(body["N"]), float(body["P"]), float(body["K"]),
            float(body["T"]), float(body["Hum"]), float(body["Moisture"]),
            Soil_Type, Crop_Type
        ]])
    except (json.JSONDecodeError, KeyError, ValueError, TypeError) as e:
        return error(f"Invalid input: {e}")

    try:
        model, scaler, le_fertilizer = get_fert_models()
        pred   = model.predict(scaler.transform(features))
        label  = le_fertilizer.inverse_transform([int(pred[0])])[0]
        return success({"fertilizer": label})
    except Exception as e:
        return error(f"Prediction failed: {e}", 500)


# ── Disease Prediction ────────────────────────
@csrf_exempt
@require_http_methods(["POST"])
def api_predict_disease(request):
    if 'image' not in request.FILES:
        return error("No image provided")
    file = request.FILES['image']
    try:
        image = Image.open(file)
        image = image.resize((128, 128))
        img_array = np.array(image)
        # Handle grayscale images if any
        if img_array.ndim == 2:
            img_array = np.stack((img_array,)*3, axis=-1)
        # Drop alpha channel if present
        if img_array.shape[-1] == 4:
            img_array = img_array[..., :3]
            
        img_array = np.expand_dims(img_array, axis=0)
        img_array = img_array.astype('float32') / 255.0
    except Exception as e:
        return error(f"Invalid image: {e}")

    try:
        model = get_disease_model()
        predictions = model.predict(img_array, verbose=0)
        class_idx = int(np.argmax(predictions[0]))
        confidence = float(predictions[0][class_idx])
        return success({
            "disease": DISEASE_CLASSES[class_idx],
            "confidence": confidence
        })
    except Exception as e:
        return error(f"Prediction failed: {e}", 500)


# ── Weather Key Proxy ─────────────────────────
@require_http_methods(["GET"])
def api_weather_key(request):
    return JsonResponse({"api_key": settings.WEATHER_API_KEY})


# ── Health Check ──────────────────────────────
@require_http_methods(["GET"])
def api_health(request):
    return success({"status": "ok", "app": "Agrismart", "version": "1.0.0"})
