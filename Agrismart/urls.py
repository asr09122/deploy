from django.urls import path
from . import api_views

app_name = 'Agrismart'

urlpatterns = [
    # REST API — consumed by the standalone frontend
    path('api/health/',              api_views.api_health,             name='api_health'),
    path('api/login/',               api_views.api_login,              name='api_login'),
    path('api/logout/',              api_views.api_logout,             name='api_logout'),
    path('api/register/',            api_views.api_register,           name='api_register'),
    path('api/me/',                  api_views.api_me,                 name='api_me'),
    path('api/predict/crop/',        api_views.api_predict_crop,       name='api_predict_crop'),
    path('api/predict/fertilizer/',  api_views.api_predict_fertilizer, name='api_predict_fertilizer'),
    path('api/predict/disease/',     api_views.api_predict_disease,    name='api_predict_disease'),
    path('api/weather-key/',         api_views.api_weather_key,        name='api_weather_key'),
]
