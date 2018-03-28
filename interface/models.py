from django.db import models
from django.contrib.auth.models import User
from django.contrib.postgres.fields import ArrayField
from datetime import datetime

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

channel_layer = get_channel_layer()

# Create your models here.


class Device(models.Model):
    dev_key = models.CharField(max_length=16, unique=True)
    users = models.ManyToManyField(User, db_index=True)
    name = models.CharField(max_length=32, default='Cascoda')
    info = models.TextField(max_length=64, default='Demo Sensor for Thread')
    ip_addr = models.CharField(max_length=45, blank=True, null=True, default=None)
    timer = models.IntegerField(default=30)
    th_min = models.FloatField(default=0)
    th_max = models.FloatField(default=1)
    registered = models.DateTimeField(auto_now_add=True)
    signed = models.DateTimeField(null=True)
    modified = models.DateTimeField(auto_now=True)
    value = models.FloatField(null=True)
    commands = ArrayField(models.CharField(max_length=4), default=['LED',])

    def __str__(self):
        return '%s | %s' % (self.dev_key, self.ip_addr)

    @staticmethod
    def create_update_device(device_key, user):
        try:
            return Device.objects.get(dev_key=device_key)
        except Device.DoesNotExist:
            new_dev = Device.objects.create(dev_key=device_key)
            new_dev.users.add(user)
            new_dev.add_log(DeviceLog.INFO, 'REGISTERED', datetime.now())
            return new_dev

    def sign_device(self, user):
        self.users.add(user)
        self.signed = datetime.now()
        self.save(update_fields=['signed'])
        self.add_log(DeviceLog.INFO, 'SIGNED by {0}'.format(user.username), datetime.now())

    def update_value(self, value, ip_addr):
        print("update triggered")
        current_time = datetime.now()
        self.value = value
        self.ip_addr = ip_addr
        self.modified = current_time
        self.save(update_fields=['value', 'modified', 'ip_addr'])
        if (self.th_min>value)or(self.th_max<value):
            self.add_log(DeviceLog.WARNING, 'SET value {0}'.format(value), current_time)
        else:
            self.add_log(DeviceLog.DEBUG, 'SET value {0}'.format(value), current_time)

        DeviceChart.objects.create(device=self, value=self.value, date=current_time)

        async_to_sync(channel_layer.group_send)("cas_dev_list", {"type": "dev_list.update"})

    def add_log(self, type, text, date):
        return DeviceLog.objects.create(device=self, type=type, text=text, date=date)

class DeviceLog(models.Model):
    INFO = 'INF'
    DEBUG = 'DBG'
    WARNING = 'WAR'
    ERROR = 'ERR'
    MESSAGE_TYPES = (
        (INFO, 'Info'),
        (DEBUG, 'Debug'),
        (WARNING, 'Warning'),
        (ERROR, 'Error')
    )

    device = models.ForeignKey(Device, on_delete=models.CASCADE, db_index=True)
    type = models.CharField(max_length=3, choices=MESSAGE_TYPES, default=INFO)
    text = models.CharField(max_length=250)
    date = models.DateTimeField()

class DeviceChart(models.Model):
    device = models.ForeignKey(Device, on_delete=models.CASCADE, db_index=True)
    value = models.FloatField()
    date = models.DateTimeField()
