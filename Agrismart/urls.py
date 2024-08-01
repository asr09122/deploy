from django.urls import path
from .import views
app_name='Agrismart'
urlpatterns = [
    path('',views.index,name='Agri'),
    path('db/',views.db,name='db'),
     path('predict_crop/', views.predict_crop, name='predict_crop'),
]