# forms.py
from django import forms
from django.contrib.auth.models import User 
from django.contrib.auth.forms import UserCreationForm
from django.core.exceptions import ValidationError

class Register_Form(UserCreationForm):
    email = forms.EmailField()

    class Meta:
        model = User
        fields = ['username', 'email', 'password1', 'password2']

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if User.objects.filter(email=email).exists():
            raise ValidationError("This email is already registered.")
        return email

    def __init__(self, *args, **kwargs):
        super(Register_Form, self).__init__(*args, **kwargs)
        for field_name, field in self.fields.items():
            field.help_text = None

class CropForm(forms.Form):
    N = forms.IntegerField()
    P = forms.IntegerField()
    K = forms.IntegerField()
    temperature = forms.IntegerField()
    humidity = forms.IntegerField()
    ph = forms.FloatField()
    rainfall = forms.IntegerField()