from rest_framework import serializers

from interface.models import DeviceChart, DeviceLog, Device

from django.contrib.auth.models import User
import datetime


class DeviceChartSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeviceChart
        fields = ('device_id', 'date', 'value')

class DeviceChartLSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeviceChart
        fields = ('date', 'value')

class DeviceLogDSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeviceLog
        fields = ('device_id', 'type', 'text', 'date')

class DeviceLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeviceLog
        fields = ('id', 'type', 'text', 'date')

class DeviceSerializer(serializers.ModelSerializer):
    number_of_war = serializers.SerializerMethodField()
    number_of_err = serializers.SerializerMethodField()

    class Meta:
        model = Device
        fields = ('id', 'users', 'name', 'info', 'ip_addr', 'timer', 'th_min', 'th_max', 'registered', 'signed', 'modified', 'value', 'commands', 'number_of_err', 'number_of_war')

    def get_number_of_war(self, obj):
        last_day = datetime.datetime.today() - datetime.timedelta(1)
        return DeviceLog.objects.filter(device_id=obj.id).filter(date__gte=last_day).filter(type=DeviceLog.WARNING).count()

    def get_number_of_err(self, obj):
        last_day = datetime.datetime.today() - datetime.timedelta(1)
        return DeviceLog.objects.filter(device_id=obj.id).filter(date__gte=last_day).filter(type=DeviceLog.ERROR).count()

class UserSerializer(serializers.ModelSerializer):
    device_set = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    class Meta:
        model = User
        fields = ('id', 'username', 'device_set', 'is_superuser')

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


class ChartSerializer(serializers.ModelSerializer):
    charts = DeviceChartLSerializer(many=True, read_only=True)

    class Meta:
        model = Device
        fields=('id', 'charts')

class DeviceLogCSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeviceLog
        fields = ('device_id', 'id', 'type', 'text', 'date')