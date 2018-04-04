from rest_framework import viewsets, status, generics
from rest_framework.response import Response
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.permissions import IsAuthenticated, IsAdminUser

from interface.models import DeviceChart, DeviceLog, Device
from django.contrib.auth.models import User
from interface.serializers import *
from interface.permissions import DevicePermission

from django.shortcuts import get_object_or_404
import datetime
from django.db.models import Avg, Subquery, OuterRef, F, RowRange, Max, Count
from django.db.models.functions import DenseRank, Ntile, Lag, Rank, Lead
from django.db.models.expressions import Window, RawSQL

from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page

class DeviceDetailViewSet(generics.RetrieveAPIView):
    queryset = Device.objects.all()
    serializer_class = DeviceSerializer
    authentication_classes = (SessionAuthentication, BasicAuthentication)
    permission_classes = (DevicePermission,)

    def get_object(self):
        queryset = self.get_queryset()
        obj = get_object_or_404(queryset, pk=self.kwargs["pk"])
        self.check_object_permissions(self.request, obj)
        return obj

class DeviceListViewSet(generics.ListAPIView):
    serializer_class = DeviceSerializer
    authentication_classes = (SessionAuthentication, BasicAuthentication)
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        user = self.request.user
        queryset = Device.objects.filter(users__id=user.id)
        return queryset

class DeviceChartViewSet(generics.ListAPIView):
    serializer_class = DeviceChartSerializer
    authentication_classes = (SessionAuthentication, BasicAuthentication)
    permission_classes = (DevicePermission,)

    def get_queryset(self):
        obj = get_object_or_404(Device.objects.all(), pk=self.kwargs["pk"])
        self.check_object_permissions(self.request, obj)
        return DeviceChart.objects.filter(device_id=self.kwargs["pk"]).only('value', 'date', 'device_id')

class DeviceLogViewSet(generics.ListAPIView):
    serializer_class = DeviceLogDSerializer
    authentication_classes = (SessionAuthentication, BasicAuthentication)
    permission_classes = (DevicePermission,)

    def get_queryset(self):
        obj = get_object_or_404(Device.objects.all(), pk=self.kwargs["pk"])
        self.check_object_permissions(self.request, obj)
        return DeviceLog.objects.filter(device_id=self.kwargs["pk"]).only('type', 'text', 'date', 'device_id')

class UserViewSet(viewsets.ViewSet):
    authentication_classes = (SessionAuthentication, BasicAuthentication)
    permission_classes = (IsAuthenticated,)

    def retrieve(self, request):
        try:
            queryset = User.objects.get(username=request.user.username)
            serializer = UserSerializer(queryset)
            return Response(serializer.data)
        except User.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

class DeviceLogLViewSet(generics.ListAPIView):
    serializer_class = DeviceLogSerializer
    authentication_classes = (SessionAuthentication, BasicAuthentication)
    permission_classes = (DevicePermission,)

    def get_queryset(self):
        obj = get_object_or_404(Device.objects.all(), pk=self.kwargs["pk"])
        self.check_object_permissions(self.request, obj)
        return DeviceLog.objects.filter(device_id=self.kwargs["pk"]).only('id', 'type', 'text', 'date').order_by('-date')[:50]

class DeviceChartLViewSet(generics.ListAPIView):
    serializer_class = DeviceChartLSerializer
    authentication_classes = (SessionAuthentication, BasicAuthentication)
    permission_classes = (DevicePermission,)

    def get_queryset(self):
        obj = get_object_or_404(Device.objects.all(), pk=self.kwargs["pk"])
        self.check_object_permissions(self.request, obj)
        return DeviceChart.objects.filter(device_id=self.kwargs["pk"]).only('value', 'date').order_by('-date')[:100]

class DeviceChartDailyAvgViewSet(generics.ListAPIView):
    serializer_class = AvgSerializer
    authentication_classes = (SessionAuthentication, BasicAuthentication)
    permission_classes = (DevicePermission,)

    def get_queryset(self):
        obj = get_object_or_404(Device.objects.all(), pk=self.kwargs["pk"])
        self.check_object_permissions(self.request, obj)
        last_7_days = datetime.datetime.today() - datetime.timedelta(7)
        queryset = DeviceChart.objects.filter(device_id=self.kwargs["pk"]).filter(date__gte=last_7_days).extra({"day": "date_trunc('day', date)"}).values("day").order_by().annotate(avg_val=Avg("value"))
        return queryset

class DeviceChartHourlyAvgViewSet(generics.ListAPIView):
    serializer_class = AvgSerializer
    authentication_classes = (SessionAuthentication, BasicAuthentication)
    permission_classes = (DevicePermission,)

    def get_queryset(self):
        obj = get_object_or_404(Device.objects.all(), pk=self.kwargs["pk"])
        self.check_object_permissions(self.request, obj)
        last_day = datetime.datetime.today() - datetime.timedelta(1)
        queryset = DeviceChart.objects.filter(device_id=self.kwargs["pk"]).filter(date__gte=last_day).extra({"day": "date_trunc('hour', date)"}).values("day").order_by().annotate(avg_val=Avg("value"))
        return queryset

class DeviceMultiChartHAViewSet(generics.ListAPIView):
    serializer_class = MultiAvgSerializer
    authentication_classes = (SessionAuthentication, BasicAuthentication)
    permission_classes = (DevicePermission,)

    def get_queryset(self):
        obj = get_object_or_404(Device.objects.all(), pk=self.kwargs["pk"])
        self.check_object_permissions(self.request, obj)
        queryset = DeviceChart.objects.filter(device_id=self.kwargs["pk"]).extra({"day": "date_trunc('hour', date) + date_part('minute', date)::int / 5 * interval '5 min'"}).values("day", "device_id").order_by("day").annotate(avg_val=Avg("value"))
        return queryset

class DeviceMultiChartHBViewSet(generics.ListAPIView):
    serializer_class = MultiAvgSerializer
    authentication_classes = (SessionAuthentication, BasicAuthentication)
    permission_classes = (DevicePermission,)

    @method_decorator(cache_page(900))
    def dispatch(self, *args, **kwargs):
        return super(DeviceMultiChartHBViewSet, self).dispatch(*args, **kwargs)

    def get_queryset(self):
        obj = get_object_or_404(Device.objects.all(), pk=self.kwargs["pk"])
        self.check_object_permissions(self.request, obj)
        queryset = DeviceChart.objects.filter(device_id=self.kwargs["pk"]).extra({"day": "date_trunc('hour', date) + date_part('minute', date)::int / 15 * interval '15 min'"}).values("day", "device_id").order_by("day").annotate(avg_val=Avg("value"))
        return queryset

class DeviceMultiChartHCViewSet(generics.ListAPIView):
    serializer_class = MultiAvgSerializer
    authentication_classes = (SessionAuthentication, BasicAuthentication)
    permission_classes = (DevicePermission,)

    @method_decorator(cache_page(1800))
    def dispatch(self, *args, **kwargs):
        return super(DeviceMultiChartHCViewSet, self).dispatch(*args, **kwargs)

    def get_queryset(self):
        obj = get_object_or_404(Device.objects.all(), pk=self.kwargs["pk"])
        self.check_object_permissions(self.request, obj)
        queryset = DeviceChart.objects.filter(device_id=self.kwargs["pk"]).extra({"day": "date_trunc('hour', date) + date_part('minute', date)::int / 30 * interval '30 min'"}).values("day", "device_id").order_by("day").annotate(avg_val=Avg("value"))
        return queryset

class DeviceMultiChartHDViewSet(generics.ListAPIView):
    serializer_class = MultiAvgSerializer
    authentication_classes = (SessionAuthentication, BasicAuthentication)
    permission_classes = (DevicePermission,)

    @method_decorator(cache_page(3600))
    def dispatch(self, *args, **kwargs):
        return super(DeviceMultiChartHDViewSet, self).dispatch(*args, **kwargs)

    def get_queryset(self):
        obj = get_object_or_404(Device.objects.all(), pk=self.kwargs["pk"])
        self.check_object_permissions(self.request, obj)
        queryset = DeviceChart.objects.filter(device_id=self.kwargs["pk"]).extra({"day": "date_trunc('hour', date)"}).values("day", "device_id").order_by("day").annotate(avg_val=Avg("value"))
        return queryset

class DeviceMultiChartDViewSet(generics.ListAPIView):
    serializer_class = MultiAvgSerializer
    authentication_classes = (SessionAuthentication, BasicAuthentication)
    permission_classes = (DevicePermission,)

    def get_queryset(self):
        obj = get_object_or_404(Device.objects.all(), pk=self.kwargs["pk"])
        self.check_object_permissions(self.request, obj)
        queryset = DeviceChart.objects.filter(device_id=self.kwargs["pk"]).extra({"day": "date_trunc('day', date)"}).values("day", "device_id").order_by("day").annotate(avg_val=Avg("value"))
        return queryset

class RTMLineChartViewSet(generics.ListAPIView):
    serializer_class = MultiAvgSerializer
    authentication_classes = (SessionAuthentication, BasicAuthentication)
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        devices = self.kwargs["pk"]
        devices = devices.split('-')
        devices = list(map(int, devices))
        limit = len(devices) * 200
        queryset = DeviceChart.objects.filter(device_id__in=devices).extra(select={'day': 'date'}).extra(select={'avg_val': 'value'}).annotate(rank = RawSQL('row_number() OVER (PARTITION BY device_id ORDER BY date DESC)',[])).order_by("rank").values("device_id", "day", "avg_val")[:limit]
        return queryset

class DeviceMultiChartTViewSet(generics.ListAPIView):
    serializer_class = MultiAvgSerializer
    authentication_classes = (SessionAuthentication, BasicAuthentication)
    permission_classes = (DevicePermission,)

    @method_decorator(cache_page(3600))
    def dispatch(self, *args, **kwargs):
        return super(DeviceMultiChartTViewSet, self).dispatch(*args, **kwargs)

    def get_queryset(self):
        obj = get_object_or_404(Device.objects.all(), pk=self.kwargs["pk"])
        self.check_object_permissions(self.request, obj)
        return DeviceChart.objects.filter(device_id=self.kwargs["pk"]).extra(select={'day': 'date'}).extra(select={'avg_val': 'value'})

class DeviceWarErrLogViewSet(generics.ListAPIView):
    serializer_class = DeviceLogSerializer
    authentication_classes = (SessionAuthentication, BasicAuthentication)
    permission_classes = (DevicePermission,)

    def get_queryset(self):
        obj = get_object_or_404(Device.objects.all(), pk=self.kwargs["pk"])
        self.check_object_permissions(self.request, obj)
        last_day = datetime.datetime.today() - datetime.timedelta(1)
        return DeviceLog.objects.filter(device_id=self.kwargs["pk"]).filter(date__gte=last_day).filter(type__in=[DeviceLog.WARNING,DeviceLog.ERROR]).only('id', 'type', 'text', 'date').order_by('-date')


class DevicesDetailsViewSet(generics. ListAPIView):
    serializer_class = DeviceSerializer
    authentication_classes = (SessionAuthentication, BasicAuthentication)
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        devices = self.kwargs["pk"]
        devices = devices.split('-')
        devices = list(map(int, devices))
        queryset = Device.objects.filter(id__in=devices)
        return queryset


class DevicesLogsViewSet(generics.ListAPIView):
    serializer_class = DeviceLogCSerializer
    authentication_classes = (SessionAuthentication, BasicAuthentication)
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        devices = self.kwargs["pk"]
        devices = devices.split('-')
        devices = list(map(int, devices))
        queryset = DeviceLog.objects.filter(device_id__in=devices).order_by('-date')[:50]
        return queryset


class ChartDownloadViewSet(generics.ListAPIView):
    serializer_class = DeviceChartSerializer
    authentication_classes = (SessionAuthentication, BasicAuthentication)
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        devices = self.kwargs["pk"]
        devices = devices.split('-')
        devices = list(map(int, devices))
        queryset = DeviceChart.objects.filter(device_id__in=devices)
        return queryset


class LogDownloadViewSet(generics.ListAPIView):
    serializer_class = DeviceLogDSerializer
    authentication_classes = (SessionAuthentication, BasicAuthentication)
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        devices = self.kwargs["pk"]
        devices = devices.split('-')
        devices = list(map(int, devices))
        queryset = DeviceLog.objects.filter(device_id__in=devices)
        return queryset

class RTMLogViewSet(generics.ListAPIView):
    serializer_class = DeviceLogDSerializer
    authentication_classes = (SessionAuthentication, BasicAuthentication)
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        devices = self.kwargs["pk"]
        devices = devices.split('-')
        devices = list(map(int, devices))
        limit = len(devices) * 50
        queryset = DeviceLog.objects.filter(device_id__in=devices).annotate(rank = RawSQL('row_number() OVER (PARTITION BY device_id ORDER BY date DESC)',[])).order_by("rank").values("device_id", "type", "date", "text")[:limit]
        return queryset

class DevicesWarErrLogViewSet(generics.ListAPIView):
    serializer_class = DeviceLogCSerializer
    authentication_classes = (SessionAuthentication, BasicAuthentication)
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        devices = self.kwargs["pk"]
        devices = devices.split('-')
        last_day = datetime.datetime.today() - datetime.timedelta(1)
        return DeviceLog.objects.filter(device_id__in=devices).filter(date__gte=last_day).filter(type__in=[DeviceLog.WARNING,DeviceLog.ERROR]).only('id', 'type', 'text', 'date', 'device_id').order_by('-date')
