from django.urls import path
from interface.views import HomeView, DashboardListView
from interface.api_views import *


urlpatterns = [
    path('', HomeView.as_view(), {'ntab': 'home'}),
    path('dashboard/', DashboardListView.as_view(), {'ntab': 'dashboard'}),

    path('api/device-chart/<pk>/', DeviceChartViewSet.as_view()),
    path('api/device-log/<pk>/', DeviceLogViewSet.as_view()),
    path('api/user/', UserViewSet.as_view({'get':'retrieve'})),
    path('api/device/<pk>/', DeviceDetailViewSet.as_view()),
    path('api/devices/', DeviceListViewSet.as_view()),
    path('api/device-log50/<pk>/', DeviceLogLViewSet.as_view()),
    path('api/device-avgd/<pk>/', DeviceChartDailyAvgViewSet.as_view()),
    path('api/device-avgh/<pk>/', DeviceChartHourlyAvgViewSet.as_view()),
    path('api/devices-lchart/<pk>/', RTMLineChartViewSet.as_view()),
    path('api/device-chart100/<pk>/', DeviceChartLViewSet.as_view()),
    path('api/device-charta/<pk>/', DeviceMultiChartHAViewSet.as_view()),
    path('api/device-chartb/<pk>/', DeviceMultiChartHBViewSet.as_view()),
    path('api/device-chartc/<pk>/', DeviceMultiChartHCViewSet.as_view()),
    path('api/device-chartd/<pk>/', DeviceMultiChartHDViewSet.as_view()),
    path('api/device-charte/<pk>/', DeviceMultiChartDViewSet.as_view()),
    path('api/device-chartt/<pk>/', DeviceMultiChartTViewSet.as_view()),
    path('api/device-ewlog/<pk>/', DeviceWarErrLogViewSet.as_view()),
    path('api/devices-details/<pk>/', DevicesDetailsViewSet.as_view()),
    path('api/devices-logs/<pk>/', DevicesLogsViewSet.as_view()),
    path('api/devices-dwchart/<pk>/', ChartDownloadViewSet.as_view()),
    path('api/devices-dwlog/<pk>/', LogDownloadViewSet.as_view()),
    path('api/devices-llogs/<pk>/',RTMLogViewSet.as_view()),
    path('api/devices-ewlogs/<pk>/',DevicesWarErrLogViewSet.as_view()),
]
