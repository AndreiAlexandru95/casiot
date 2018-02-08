# Tutorial

## Django | Channels | Django REST Framework | React | PostgreSQL 

Considering the tedious work of setting up new Django Projects such that the above futures work toghether quick and as expected, I decided to create this Tutorial. 


### How it works

Before going any further it is relevant to mention the versions of the applications when I first started working on my current project.

| Package		| Version |
|:-------------:|:-------:|
| `python`		| 3.5	  |
| `django`      | 2.0.2   |
| `channels`    | 2.0.2	  |
| `postgresql`	| 9.6	  |
| `virtualenv`	| 15.1	  |
| ``			| 		  |
| ``			| 		  |
| ``			| 		  |
| ``			| 		  |
| ``			| 		  |


### Initial Setup

#### 1) Setup a new project on **Git**. 
Don't be lazy and save all your work before is too late! 
This should be common knowledge for any programmer so I will just assume you know how to do it. If you do not know, sorry, but I won't get in any details about it.

#### 2) Setup a **virtualenv**
It is got practice to keep your project clean and isolated from the rest of your projects. So better build a virtual environemnt where you can play. 
* `virtualenv -p python3.5 venv`
* `source venv/bin/activate`
* `deactivate`
Before moving any further, please activate the virtualenv. 

#### 3) Setup **PostgreSQL**
There are multiple DBs you can choose from. Every one of them has its ups and downs. Due to personal preference and public opinion, I chosed PostgreSQL. For other supported DBs go to [Django Documentation](https://docs.djangoproject.com/en/2.0/ref/databases/ "Django Documentation")
1. Install required packages
 * `sudo apt-get update`
 * `sudo apt-get install python3-pip python3-dev libpq-dev postgresql postgresql-contrib`
2. Create DB and User for DB
 * `sudo su -postgres psql`
 * `CREATE DATABASE casiot_db;`
 * `CREATE USER casiot_user WITH PASSWORD 'casiot_pass'; `
3. Set default settings for django optimization & compatability
 * `ALTER ROLE casiot_user SET client_encoding TO 'utf8';`
 * `ALTER ROLE casiot_user SET default_transaction_isolation TO 'read committed';`
 * `ALTER ROLE casiot_user SET timezone TO 'UTC';`
4. Give user access to the DB
 * `GRANT ALL PRIVILEGES ON DATABASE casiot_db TO casiot_user;`
5. Exit SQL prompt 
 * `\q`

#### 4) Configure **Django** with **PostgreSQL**
Now lets get into Django. Excited already?
1. Install `django` and `psycopg2`
 * `pip install django psycopg2`
2. Start Django Project
 * `django-admin.py startproject casiot .`
3. Configure Django Database Settings
 ```python
 # settings.py
 DATABASES = {
 	'default': {
 		'ENGINE': 'django.db.backends.postgresql',
 		'NAME': 'casiot_db',
 		'USER': 'casiot_user',
 		'PASSWORD': 'casiot_pass',
 		'HOST': 'localhost',
 		'PORT': '',
 	}
 }
 ```
4. Populate the initial database 
 * `python manage.py makemigrations`
 * `python manage.py migrate`
5. Create admin
 * `python manage.py createsuperuser`
6. Change *ALLOWED_HOSTS* to allow the server being hosted from your local ip address
 ```python
 # settings.py
 ALLOWED_HOSTS = ['192.168.10.254', 'localhost', '127.0.0.1', '[fd14:ac28:a278:1:ba27:ebff:fecd:bb5b]',]
 ```  
7. Test if server is up
 * `python manage.py runserver 0.0.0.0:8000`
 * Go to `local-ip-address:8000/`

#### 5) Configure **channels**
Lets get some WebSockets configuration up and running
1. Install `channels`
 * `pip install channels`
2. Make `channels` available to `django`
 ```python
 # settings.py
 INSTALLED_APPS = (
 	...
 	'channels',
 )
 ```
3. Make a default routing
 ```python
 # casiot/routing.py
 from channels.routing import ProtocolTypeRouter
 application = ProtocolTypeRouter({
 	# Empty for now
 })
 ```
4. Set ASGI_APPLICATION
 ```python
 # settings.py
 ASGI_APPLICATION = "casiot.routing.application"
 ```
5. Set ASGI entrypoint
 ```python
 # casiot/asgi.py
 import os
 import django
 from channels.routing import get_default_application
 os.environ.setdefault("DJANGO_SETTINGS_MODULE", "casiot.settings")
 django.setup()
 application = get_default_application()
 ```
6. Setup CHANNEL_LAYERS 
 ```python
 # casiot/settings.py
    CHANNEL_LAYERS = {
        "default": {
            "BACKEND": "channels_redis.core.RedisChannelLayer",
            "CONFIG": {
                "hosts": [("localhost", 6379)],
            },
        },
    }
 ```
7. Install channels_redis 
 `pip install channels_redis` 

```
Ok, so now that we have finished setting up channels taking in consideration future deployment lets test the Redis Server.

    run *daphne -b 0.0.0.0 -p 8000 casiot.asgi:application*

Now, those ugly 404s in your console and your admin page looking like s**t mean everything worked out. Don't panic. The reason is simple you need some workers to work those channels and send the static files to the client. The setup is easy and I am going to present them at Deployment section.   
```

