from rest_framework import viewsets
from rest_framework.response import Response

from interface.models import DeviceChart
from interface.serializers import DeviceChartSerializer


class DeviceChartViewSet(viewsets.ViewSet):
    def list(self, request, pk=None):
        queryset = DeviceChart.objects.filter(device=pk).only('value', 'date')
        serializer = DeviceChartSerializer(queryset, many=True)
        return Response(serializer.data)
