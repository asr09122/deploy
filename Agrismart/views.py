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

from .forms import CropForm
import pickle
import os

# Load pre-trained scikit-learn model
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
with open(os.path.join(BASE_DIR, 'Agrismart/models/RandomForest.pkl'), 'rb') as f:
    crop_model = pickle.load(f)


def predict_crop(request):
    if request.method == 'POST':
        form = CropForm(request.POST)
        if form.is_valid():
            data = form.cleaned_data
            prediction = crop_model.predict([list(data.values())])
            return render(request, 'Agrismart/crop_result.html', {'prediction': prediction})
    else:
        form = CropForm()
    return render(request, 'Agrismart/crop_form.html', {'form': form})
 
