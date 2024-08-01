from django.contrib import admin
from django.urls import path,include
from Agrismart import views as u_views
from django.contrib.auth import views as l_views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('',u_views.index,name='agri'),
    path('Agri',include('Agrismart.urls')),
    path("__reload__/", include("django_browser_reload.urls")),
    path('register/',u_views.regi,name='regi'),
    path('login/',l_views.LoginView.as_view(template_name='Agrismart/login.html'),name='login'),
    path('logout/',u_views.logout_view,name='logout'),
     path('db/',u_views.db,name='data'),
     path('ac/',u_views.ac,name='ac'),
     path('predict_crop/', u_views.predict_crop, name='predict_crop'),


]