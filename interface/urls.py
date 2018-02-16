from django.urls import path
from interface.views import HomeView
from interface.api_views import DeviceChartViewSet, DeviceLogViewSet, DeviceViewSet


urlpatterns = [
    path('', HomeView.as_view()),

    path('api/device-chart/<pk>/', DeviceChartViewSet.as_view({'get': 'list'})),
    path('api/device-log/<pk>/', DeviceLogViewSet.as_view({'get': 'list'})),
    path('api/device/<pk>/', DeviceViewSet.as_view({'get': 'retrieve'})),
]
