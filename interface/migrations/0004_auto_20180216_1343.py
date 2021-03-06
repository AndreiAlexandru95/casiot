# Generated by Django 2.0.2 on 2018-02-16 13:43

from django.conf import settings
import django.contrib.postgres.fields
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('interface', '0003_auto_20180215_1519'),
    ]

    operations = [
        migrations.CreateModel(
            name='Device',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('dev_key', models.CharField(max_length=16, unique=True)),
                ('name', models.CharField(default='Cascoda', max_length=32)),
                ('info', models.TextField(default='Demo Sensor for Thread', max_length=64)),
                ('ip_addr', models.CharField(blank=True, default=None, max_length=45, null=True, unique=True)),
                ('timer', models.IntegerField(default=30)),
                ('th_min', models.FloatField(default=0)),
                ('th_max', models.FloatField(default=1)),
                ('registered', models.DateTimeField(auto_now_add=True)),
                ('signed', models.DateTimeField()),
                ('modified', models.DateTimeField(auto_now=True)),
                ('value', models.FloatField()),
                ('commands', django.contrib.postgres.fields.ArrayField(base_field=models.CharField(max_length=4), default=['LED'], size=None)),
                ('user', models.ForeignKey(blank=True, default=None, null=True, on_delete=django.db.models.deletion.SET_DEFAULT, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='DeviceLog',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('type', models.CharField(choices=[('INF', 'Info'), ('DBG', 'Debug'), ('WAR', 'Warning'), ('ERR', 'Error')], default='INF', max_length=3)),
                ('text', models.CharField(max_length=250)),
                ('date', models.DateTimeField()),
                ('device', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='interface.Device')),
            ],
        ),
        migrations.AlterField(
            model_name='devicechart',
            name='device',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='interface.Device'),
        ),
    ]
