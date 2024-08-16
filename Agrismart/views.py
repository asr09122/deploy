from django.shortcuts import render
from django.contrib.auth.forms import UserCreationForm
from django.contrib import messages
from django.shortcuts import redirect
from django.contrib.auth import authenticate, logout as auth_logout
from django.contrib.auth.decorators import login_required
from .forms import Register_Form
from django.urls import reverse
# Create your views here.

def regi(request):
    if request.method=='POST':
        form=Register_Form(request.POST)
        if form.is_valid():
            form.save()
            username=form.cleaned_data.get('username')
            messages.success(request,f'welcome {username}')
            return redirect(reverse('app:login'))

    else:
        form=Register_Form()
    return render(request,'Agrismart/signup.html',{'form':form})


@login_required
def logout_view(request):
    if request.user.is_authenticated:
        auth_logout(request)
    return redirect('Agrismart:Agri')

def index(request):
    return render(request,'Agrismart/index.html')

def db(request):
    return render(request,'Agrismart/db.html')

def ac(request):
    return render(request,'Agrismart/acc.html')


# smartfarming/views.py

from django.shortcuts import render
from .forms import CropForm
import joblib
import numpy as np

from django.shortcuts import render
from .forms import CropForm
import joblib
import numpy as np

def predict_crop(request):
    if request.method == 'POST':
        form = CropForm(request.POST)
        if form.is_valid():
            data = form.cleaned_data
            model_path = 'Agrismart/models/random_forest_model.pkl'  # Update this path
            scaler_path = 'Agrismart/models/scaler1.pkl'  # Update this path
            le_crop_path = 'Agrismart/models/crop.pkl'  # Update this path

            model = joblib.load(model_path)
            scaler = joblib.load(scaler_path)
            le_crop = joblib.load(le_crop_path)

            features = np.array([[data['N'], data['P'], data['K'], data['temperature'], data['humidity'], data['ph'], data['rainfall']]])
            features_scaled = scaler.transform(features)
            prediction = model.predict(features_scaled)
            
            predicted_label = le_crop.inverse_transform([int(prediction[0])])[0]
            
            return render(request, 'Agrismart/crop_result.html', {'prediction': predicted_label})
    else:
        form = CropForm()
    
    return render(request, 'Agrismart/crop_form.html', {'form': form})

from .forms import FertilizerForm

def predict_fertilizer(request):
    if request.method == 'POST':
        form = FertilizerForm(request.POST)
        if form.is_valid():
            data = form.cleaned_data

            # Load pre-trained model and preprocessing objects
            model_path = 'Agrismart/models/random_forest_fertilizer_model.pkl'  # Update this path
            scaler_path = 'Agrismart/models/scaler.pkl'  # Update this path
            le_fertilizer_path = 'Agrismart/models/le_fertilizer.pkl'  # Update this path
            le_crop_path = 'Agrismart/models/le_crop.pkl'  # Update this path
            le_soil_path = 'Agrismart/models/le_soil.pkl'  # Update this path

            model = joblib.load(model_path)
            scaler = joblib.load(scaler_path)
            le_fertilizer = joblib.load(le_fertilizer_path)
            le_crop = joblib.load(le_crop_path)
            le_soil = joblib.load(le_soil_path)

            # Prepare input features
            features = np.array([
                [data['N'], data['P'], data['K'], data['T'], data['Hum'], data['Moisture'], data['Soil_Type'], data['Crop_Type']]
            ])
            features_scaled = scaler.transform(features)

            # Make prediction
            prediction = model.predict(features_scaled)
            
            # Convert numerical predictions to labels
            predicted_fertilizer = le_fertilizer.inverse_transform([int(prediction[0])])[0]
            
            return render(request, 'Agrismart/fertilizer_result.html', {'prediction': predicted_fertilizer})
    else:
        form = FertilizerForm()
    
    return render(request, 'Agrismart/fertilizer_form.html', {'form': form})
