#!/bin/bash

clear

echo "<Start redis-server>"
redis-server --port 8001 &

echo "<Run memcached>"
memcached &

echo "<Start Django Server>"
python manage.py runserver 0.0.0.0:8000