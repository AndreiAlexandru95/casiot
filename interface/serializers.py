from rest_framework import serializers

from interface.models import DeviceChart, DeviceLog, Device

from django.contrib.auth.models import User


class DeviceChartSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeviceChart
        fields = ('id', 'value', 'date')

class DeviceLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeviceLog
        fields = ('id', 'type', 'text', 'date')

class DeviceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Device
        fields = ('id', 'users', 'name', 'info', 'ip_addr', 'timer', 'th_min', 'th_max', 'registered', 'signed', 'modified', 'value', 'commands')

class UserSerializer(serializers.ModelSerializer):
    device_set = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    class Meta:
        model = User
        fields = ('id', 'username', 'device_set')

class ConsoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeviceLog
        fields = ('id', 'device_id', 'type', 'text', 'date')
