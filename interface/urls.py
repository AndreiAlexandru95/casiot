from django.urls import path
from interface.views import HomeView, DeviceListView, DeviceRetrieveView, LogListView, ChartListView
from interface.api_views import DeviceChartViewSet, DeviceLogViewSet, UserViewSet, DeviceDetailViewSet, DeviceListViewSet, DeviceChartFilterViewSet, DeviceLogFilterViewSet, ConsoleListViewSet, DeviceLogLViewSet, DeviceChartLViewSet


urlpatterns = [
    path('', HomeView.as_view()),
    path('devices/', DeviceListView.as_view()),
    path('device/<pk>/', DeviceRetrieveView.as_view()),
    path('logs/', LogListView.as_view()),
    path('charts/', ChartListView.as_view()),

    path('api/device-chart/<pk>/', DeviceChartViewSet.as_view()),
    path('api/device-log/<pk>/', DeviceLogViewSet.as_view()),
    path('api/user/', UserViewSet.as_view({'get':'retrieve'})),
    path('api/device/<pk>/', DeviceDetailViewSet.as_view()),
    path('api/devices/', DeviceListViewSet.as_view()),
    path('api/device-chart/<pk>/s_date/<s_date>/e_date/<e_date>/', DeviceChartFilterViewSet.as_view()),
    path('api/device-log/<pk>/s_date/<s_date>/e_date/<e_date>/type/<type>/', DeviceLogFilterViewSet.as_view()),
    path('api/console/', ConsoleListViewSet.as_view()),
    path('api/device-log50/<pk>/', DeviceLogLViewSet.as_view()),
    path('api/device-chart100/<pk>/', DeviceChartLViewSet.as_view()),
]
