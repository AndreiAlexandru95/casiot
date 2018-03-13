from rest_framework import viewsets, status, generics
from rest_framework.response import Response
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.permissions import IsAuthenticated, IsAdminUser

from interface.models import DeviceChart, DeviceLog, Device
from django.contrib.auth.models import User
from interface.serializers import DeviceChartSerializer, DeviceLogSerializer, DeviceSerializer, UserSerializer, ConsoleSerializer, AvgSerializer, DeviceMultiChartSerializer, MultiAvgSerializer
from interface.permissions import DevicePermission

from django.shortcuts import get_object_or_404
import datetime
from django.db.models import Avg, Subquery, OuterRef

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
        return DeviceChart.objects.filter(device_id=self.kwargs["pk"]).only('value', 'date')

class DeviceLogViewSet(generics.ListAPIView):
    serializer_class = DeviceLogSerializer
    authentication_classes = (SessionAuthentication, BasicAuthentication)
    permission_classes = (DevicePermission,)

    def get_queryset(self):
        obj = get_object_or_404(Device.objects.all(), pk=self.kwargs["pk"])
        self.check_object_permissions(self.request, obj)
        return DeviceLog.objects.filter(device_id=self.kwargs["pk"]).only('type', 'text', 'date')

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

class DeviceChartFilterViewSet(generics.ListAPIView):
    serializer_class = DeviceChartSerializer
    authentication_classes = (SessionAuthentication, BasicAuthentication)
    permission_classes = (DevicePermission,)

    def get_queryset(self):
        obj = get_object_or_404(Device.objects.all(), pk=self.kwargs["pk"])
        self.check_object_permissions(self.request, obj)
        return DeviceChart.objects.filter(device_id=self.kwargs["pk"], date__gte=datetime.datetime.fromtimestamp(float(self.kwargs["s_date"])), date__lte=datetime.fromtimestamp(float(self.kwargs["e_date"]))).only('value', 'date')

class DeviceLogFilterViewSet(generics.ListAPIView):
    serializer_class = DeviceLogSerializer
    authentication_classes = (SessionAuthentication, BasicAuthentication)
    permission_classes = (DevicePermission,)

    def get_queryset(self):
        obj = get_object_or_404(Device.objects.all(), pk=self.kwargs["pk"])
        self.check_object_permissions(self.request, obj)
        type = float(self.kwargs["type"])
        if type == 0:
            return DeviceLog.objects.filter(device_id=self.kwargs["pk"], date__gte=datetime.datetime.fromtimestamp(float(self.kwargs["s_date"])), date__lte=datetime.datetime.fromtimestamp(float(self.kwargs["e_date"])), type=DeviceLog.INFO).only('type', 'text', 'date')
        elif type == 1:
            return DeviceLog.objects.filter(device_id=self.kwargs["pk"], date__gte=datetime.datetime.fromtimestamp(float(self.kwargs["s_date"])), date__lte=datetime.datetime.fromtimestamp(float(self.kwargs["e_date"])), type=DeviceLog.DEBUG).only('type', 'text', 'date')
        elif type == 2:
            return DeviceLog.objects.filter(device_id=self.kwargs["pk"], date__gte=datetime.datetime.fromtimestamp(float(self.kwargs["s_date"])), date__lte=datetime.datetime.fromtimestamp(float(self.kwargs["e_date"])), type=DeviceLog.WARNING).only('type', 'text', 'date')
        elif type == 3:
            return DeviceLog.objects.filter(device_id=self.kwargs["pk"], date__gte=datetime.datetime.fromtimestamp(float(self.kwargs["s_date"])), date__lte=datetime.datetime.fromtimestamp(float(self.kwargs["e_date"])), type=DeviceLog.ERROR).only('type', 'text', 'date')
        else:
            return DeviceLog.objects.filter(device_id=self.kwargs["pk"], date__gte=datetime.datetime.fromtimestamp(float(self.kwargs["s_date"])), date__lte=datetime.datetime.fromtimestamp(float(self.kwargs["e_date"]))).only('type', 'text', 'date')

class ConsoleListViewSet(generics.ListAPIView):
    serializer_class = ConsoleSerializer
    authentication_classes = (SessionAuthentication, BasicAuthentication)
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        user = self.request.user
        logs = DeviceLog.objects.filter(device_id__in=Device.objects.filter(users__id__contains=user.id),).order_by('-date')[:25]
        return logs

class DeviceLogLViewSet(generics.ListAPIView):
    serializer_class = DeviceLogSerializer
    authentication_classes = (SessionAuthentication, BasicAuthentication)
    permission_classes = (DevicePermission,)

    def get_queryset(self):
        obj = get_object_or_404(Device.objects.all(), pk=self.kwargs["pk"])
        self.check_object_permissions(self.request, obj)
        return DeviceLog.objects.filter(device_id=self.kwargs["pk"]).only('id', 'type', 'text', 'date').order_by('-date')[:50]

class DeviceChartLViewSet(generics.ListAPIView):
    serializer_class = DeviceChartSerializer
    authentication_classes = (SessionAuthentication, BasicAuthentication)
    permission_classes = (DevicePermission,)

    def get_queryset(self):
        obj = get_object_or_404(Device.objects.all(), pk=self.kwargs["pk"])
        self.check_object_permissions(self.request, obj)
        return DeviceChart.objects.filter(device_id=self.kwargs["pk"]).only('id', 'value', 'date').order_by('-date')[:100]

class DeviceChartDailyAvgViewSet(generics.ListAPIView):
    serializer_class = AvgSerializer
    authentication_classes = (SessionAuthentication, BasicAuthentication)
    permission_classes = (DevicePermission,)

    def get_queryset(self):
        obj = get_object_or_404(Device.objects.all(), pk=self.kwargs["pk"])
        self.check_object_permissions(self.request, obj)
        last_7_days = datetime.datetime.today() - datetime.timedelta(14)
        queryset = DeviceChart.objects.filter(device_id=self.kwargs["pk"]).filter(date__gte=last_7_days).extra({"day": "date_trunc('day', date)"}).values("day").order_by().annotate(avg_val=Avg("value"))
        print(queryset)
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

class DeviceMultiChartViewSet(generics.ListAPIView):
    serializer_class = DeviceMultiChartSerializer
    authentication_classes = (SessionAuthentication, BasicAuthentication)
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        devices = self.kwargs["pk"]
        devices = devices.split('-')
        devices = list(map(int, devices))
        return DeviceChart.objects.filter(device_id__in=devices).order_by('device_id','-date')

class DeviceMultiChartHViewSet(generics.ListAPIView):
    serializer_class = MultiAvgSerializer
    authentication_classes = (SessionAuthentication, BasicAuthentication)
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        devices = self.kwargs["pk"]
        devices = devices.split('-')
        devices = list(map(int, devices))
        queryset = DeviceChart.objects.filter(device_id__in=devices).extra({"day": "date_trunc('hour', date)"}).values("day", "device_id").order_by("day").annotate(avg_val=Avg("value"))
        return queryset

class DeviceMultiChartDViewSet(generics.ListAPIView):
    serializer_class = MultiAvgSerializer
    authentication_classes = (SessionAuthentication, BasicAuthentication)
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        devices = self.kwargs["pk"]
        devices = devices.split('-')
        devices = list(map(int, devices))
        queryset = DeviceChart.objects.filter(device_id__in=devices).extra({"day": "date_trunc('day', date)"}).values("day", "device_id").order_by("day").annotate(avg_val=Avg("value"))
        return queryset

