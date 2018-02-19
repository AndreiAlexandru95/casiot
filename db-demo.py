import os
import django

import datetime
from random import randint

def main():
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "casiot.settings")
    django.setup()

    from interface.models import Device
    from django.contrib.auth.models import User

    andrei = User.objects.create_user('andrei', 'alex@demo.com', 'fc82bqk2')
    victor = User.objects.create_user('victor', 'victor@demo.com', 'fc82bqk2')

    admin = User.objects.get(username='admin')
    dev1 = Device.create_update_device(device_key='key01', user=admin)
    dev1.sign_device(andrei)
    dev2 = Device.create_update_device(device_key='key02', user=admin)
    dev2.sign_device(victor)

    for i in range(1,10001):
        d_value = randint(25,35)
        ok = randint(1, 4)
        if ok == 1:
            d_value += 0.25
        elif ok == 2:
            d_value += 0.5
        elif ok == 3:
            d_value += 0.75

        dev = Device.create_update_device(device_key='key01', user=admin)
        dev.update_value(value=d_value, ip_addr='demo-ip-01')
        dev = Device.create_update_device(device_key='key02', user=admin)
        dev.update_value(value=d_value, ip_addr='demo-ip-02')

if __name__ == "__main__":
    main()
