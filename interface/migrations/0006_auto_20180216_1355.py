# Generated by Django 2.0.2 on 2018-02-16 13:55

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('interface', '0005_auto_20180216_1348'),
    ]

    operations = [
        migrations.AlterField(
            model_name='device',
            name='signed',
            field=models.DateTimeField(null=True),
        ),
        migrations.AlterField(
            model_name='device',
            name='value',
            field=models.FloatField(null=True),
        ),
    ]
