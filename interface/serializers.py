from rest_framework import serializers

from interface.models import DeviceChart, DeviceLog, Device

from django.contrib.auth.models import User


class DeviceChartSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeviceChart
        fields = ('id', 'date', 'value')

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

class AvgSerializer(serializers.Serializer):
    day = serializers.DateTimeField()
    avg_val = serializers.FloatField()

class DeviceMultiChartSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeviceChart
        fields = ('device_id', 'date', 'value')

class MultiAvgSerializer(serializers.Serializer):
    day = serializers.DateTimeField()
    avg_val = serializers.FloatField()
    device_id = serializers.IntegerField()