import os
import django

import datetime
from random import randint

def main():
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "casiot.settings")
    django.setup()

    from interface.models import DeviceChart

    v_date = datetime.datetime(2010, 1, 1, 12, 0, 0)

    for i in range(1,3):
        for j in range(700000):
            v_date += datetime.timedelta(days=1)
            d_value = randint(25, 35)
            ok = randint(1, 4)
            if ok == 1:
                d_value += 0.25
            elif ok == 2:
                d_value += 0.5
            elif ok == 3:
                d_value += 0.75
            DeviceChart.objects.create(device=i, value=d_value, date=v_date)
            v_date += datetime.timedelta(minutes=30)
            DeviceChart.objects.create(device=i, value=d_value, date=v_date)


if __name__ == "__main__":
    main()
