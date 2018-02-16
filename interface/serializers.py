from rest_framework import serializers

from interface.models import DeviceChart, DeviceLog, Device


class DeviceChartSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeviceChart
        fields = ('value', 'date')

class DeviceLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeviceLog
        fields = ('type', 'text', 'date')

class DeviceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Device
        fields = ('user', 'name', 'info', 'ip_addr', 'timer', 'th_min', 'th_max', 'registered', 'signed', 'modified', 'value', 'commands')
