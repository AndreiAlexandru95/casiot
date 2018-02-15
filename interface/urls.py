from django.urls import path
from interface.views import HomeView
from interface.api_views import DeviceChartViewSet


urlpatterns = [
    path('', HomeView.as_view()),

    path('device-chart/<pk>/', DeviceChartViewSet.as_view({'get': 'list'})),
]
