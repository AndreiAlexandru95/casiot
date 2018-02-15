from django.db import models

# Create your models here.


class DeviceChart(models.Model):
    device = models.IntegerField(db_index=True)
    value = models.FloatField()
    date = models.DateTimeField()
