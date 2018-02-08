from django.urls import path
from interface.views import HomeView


urlpatterns = [
    path('', HomeView.as_view()),
]