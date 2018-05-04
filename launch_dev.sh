#!/bin/bash

clear

echo "<Start redis-server>"
redis-server --port 8001 &

echo "<Run memcached>"
memcached &

echo "<Start Django Server>"
python manage.py runserver [::]:8000 &

echo "<Start CoAP Server>"
python CoAPServer.py
