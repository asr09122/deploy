from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.views.static import serve
import os

frontend_dir = os.path.join(settings.BASE_DIR, 'frontend')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('Agri/', include('Agrismart.urls')),
    path('', serve, {'document_root': frontend_dir, 'path': 'index.html'}),
    re_path(r'^(?P<path>.*)$', serve, {'document_root': frontend_dir}),
]
