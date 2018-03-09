from rest_framework import viewsets, status, generics
from rest_framework.response import Response
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.permissions import IsAuthenticated, IsAdminUser

from interface.models import DeviceChart, DeviceLog, Device
from django.contrib.auth.models import User
from interface.serializers import DeviceChartSerializer, DeviceLogSerializer, DeviceSerializer, UserSerializer, ConsoleSerializer
from interface.permissions import DevicePermission

from django.shortcuts import get_object_or_404
from datetime import datetime

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
        return DeviceChart.objects.filter(device_id=self.kwargs["pk"], date__gte=datetime.fromtimestamp(float(self.kwargs["s_date"])), date__lte=datetime.fromtimestamp(float(self.kwargs["e_date"]))).only('value', 'date')

class DeviceLogFilterViewSet(generics.ListAPIView):
    serializer_class = DeviceLogSerializer
    authentication_classes = (SessionAuthentication, BasicAuthentication)
    permission_classes = (DevicePermission,)

    def get_queryset(self):
        obj = get_object_or_404(Device.objects.all(), pk=self.kwargs["pk"])
        self.check_object_permissions(self.request, obj)
        type = float(self.kwargs["type"])
        if type == 0:
            return DeviceLog.objects.filter(device_id=self.kwargs["pk"], date__gte=datetime.fromtimestamp(float(self.kwargs["s_date"])), date__lte=datetime.fromtimestamp(float(self.kwargs["e_date"])), type=DeviceLog.INFO).only('type', 'text', 'date')
        elif type == 1:
            return DeviceLog.objects.filter(device_id=self.kwargs["pk"], date__gte=datetime.fromtimestamp(float(self.kwargs["s_date"])), date__lte=datetime.fromtimestamp(float(self.kwargs["e_date"])), type=DeviceLog.DEBUG).only('type', 'text', 'date')
        elif type == 2:
            return DeviceLog.objects.filter(device_id=self.kwargs["pk"], date__gte=datetime.fromtimestamp(float(self.kwargs["s_date"])), date__lte=datetime.fromtimestamp(float(self.kwargs["e_date"])), type=DeviceLog.WARNING).only('type', 'text', 'date')
        elif type == 3:
            return DeviceLog.objects.filter(device_id=self.kwargs["pk"], date__gte=datetime.fromtimestamp(float(self.kwargs["s_date"])), date__lte=datetime.fromtimestamp(float(self.kwargs["e_date"])), type=DeviceLog.ERROR).only('type', 'text', 'date')
        else:
            return DeviceLog.objects.filter(device_id=self.kwargs["pk"], date__gte=datetime.fromtimestamp(float(self.kwargs["s_date"])), date__lte=datetime.fromtimestamp(float(self.kwargs["e_date"]))).only('type', 'text', 'date')

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
        return DeviceChart.objects.filter(device_id=self.kwargs["pk"]).only('id', 'value', 'date').order_by('-date')