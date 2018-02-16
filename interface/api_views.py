from rest_framework import viewsets, status
from rest_framework.response import Response

from interface.models import DeviceChart, DeviceLog, Device
from interface.serializers import DeviceChartSerializer, DeviceLogSerializer, DeviceSerializer

from django.shortcuts import get_object_or_404


class DeviceChartViewSet(viewsets.ViewSet):
    def list(self, request, pk=None):
        queryset = DeviceChart.objects.filter(device=pk).only('value', 'date')
        serializer = DeviceChartSerializer(queryset, many=True)
        return Response(serializer.data)

class DeviceLogViewSet(viewsets.ViewSet):
    def list(self, request, pk=None):
        queryset = DeviceLog.objects.filter(device=pk).only('type', 'text', 'date')
        serializer = DeviceLogSerializer(queryset, many=True)
        return Response(serializer.data)

class DeviceViewSet(viewsets.ViewSet):
    def retrieve(self, request, pk=None):
        try:
            queryset = Device.objects.get(pk=pk)
            serializer = DeviceSerializer(queryset)
            return Response(serializer.data)
        except Device.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
