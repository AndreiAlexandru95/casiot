from django.urls import path
from interface.views import HomeView, DeviceListView
from interface.api_views import DeviceChartViewSet, DeviceLogViewSet, UserViewSet, DeviceDetailViewSet, DeviceListViewSet, DeviceChartFilterViewSet, DeviceLogFilterViewSet


urlpatterns = [
    path('', HomeView.as_view()),
    path('devices/', DeviceListView.as_view()),

    path('api/device-chart/<pk>/', DeviceChartViewSet.as_view()),
    path('api/device-log/<pk>/', DeviceLogViewSet.as_view()),
    path('api/user/', UserViewSet.as_view({'get':'retrieve'})),
    path('api/device/<pk>/', DeviceDetailViewSet.as_view()),
    path('api/devices/', DeviceListViewSet.as_view()),
    path('api/device-chart/<pk>/s_date/<s_date>/e_date/<e_date>/', DeviceChartFilterViewSet.as_view()),
    path('api/device-log/<pk>/s_date/<s_date>/e_date/<e_date>/type/<type>/', DeviceLogFilterViewSet.as_view()),

]
