from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.permissions import IsAuthenticated

from interface.models import DeviceChart, DeviceLog, Device
from django.contrib.auth.models import User
from interface.serializers import DeviceChartSerializer, DeviceLogSerializer, DeviceSerializer, UserSerializer
from interface.permissions import DevicePermission

from django.shortcuts import get_object_or_404


class DeviceChartViewSet(viewsets.ViewSet):
    authentication_classes = (SessionAuthentication, BasicAuthentication)
    permission_classes = (DevicePermission,)

    def list(self, request, pk=None):
        queryset = DeviceChart.objects.filter(device=pk).only('value', 'date')
        serializer = DeviceChartSerializer(queryset, many=True)
        return Response(serializer.data)

class DeviceLogViewSet(viewsets.ViewSet):
    authentication_classes = (SessionAuthentication, BasicAuthentication)
    permission_classes = (DevicePermission,)

    def list(self, request, pk=None):
        queryset = DeviceLog.objects.filter(device=pk).only('type', 'text', 'date')
        serializer = DeviceLogSerializer(queryset, many=True)
        return Response(serializer.data)

class DeviceViewSet(viewsets.ViewSet):
    authentication_classes = (SessionAuthentication, BasicAuthentication)
    permission_classes = (DevicePermission,)

    def retrieve(self, request, pk=None):
        try:
            queryset = Device.objects.get(pk=pk)
            serializer = DeviceSerializer(queryset)
            return Response(serializer.data)
        except Device.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

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