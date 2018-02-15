from rest_framework import serializers

from interface.models import DeviceChart


class DeviceChartSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeviceChart
        fields = ('value', 'date')

