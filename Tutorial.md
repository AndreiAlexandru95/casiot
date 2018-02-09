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
| `npm`			| 5.6	  |


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
Ok, so now that we have finished setting up channels taking in consideration
future deployment lets test the Redis Server.

    run *daphne -b 0.0.0.0 -p 8000 casiot.asgi:application*

Now, those ugly 404s in your console and your admin page looking like s**t
mean everything worked out. Don't panic. The reason is simple you need some
workers to work those channels and send the static files to the client. The
setup is easy and I am going to present them at Deployment section. 

If you have an ipv6 host then also test (and see what happends)

    run *daphne -b [::] -p 8000 casiot.asgi:application*   
```

#### Ok so we have finally finished setting up the backend! (mostly) 
Basically this is it, this is what you are going to need to start developing on a backend based on django that wants to have channels incorporated.  

#### 6) FRONTEND! Django REST Framework configuration
1. Install DRF
 `pip install djangorestframework`

2. Make its libraries available to django applications
 ```python
 # casiot/settings.py
 INSTALLED_APPS = (
    ...
    rest_framework,
)
 ```

 3. That is it. It is that simple to have a top API available

#### 7) Setting up Django Debug Toolbar 

### Now this is optional (if you don't want to have control over your project performance) 

1. Install DDT
 `pip install django-debug-toolbar`

2. Make its libraries available to django applications
 ```python
 # casiot/settings.py
 INSTALLED_APPS = (
    ...
    'debug_toolbar',
    )
 ```

3. Since we are here, lets tell django's backend to consider DDT's libraries 
 ```python
 # casiot/settings.py
 MIDDLEWARE = [
    ...
    'debug_toolbar.middleware.DebugToolbarMiddleware',
 ]
 ```

4. Lets now use DDT's libraries to send the debug panel only to trusted clients
 ```python
 # casiot/settings.py
INTERNAL_IPS = ('127.0.0.1', 'localhost', '192.168.10.254', '[fd14:ac28:a278:1:ba27:ebff:fecd:bb5b]',)
 ```
 ```python
 Now if you want, in development you can add the following piece and make it available to everyone
 # casiot/settings.py
 def show_toolbar(request):
    return True
 DEBUG_TOOLBAR_CONFIG = {
    "SHOW_TOOLBAR_CALLBACK": show_toolbar,
 }
 ```
 ```
 One last thing, before we move on, if you go production delete all about DDT including the above
 ```

5. Add DDT's urls to django
 ```python
# casiot/urls.py
...
from django.conf import settings
from django.urls import include
...
...
if settings.DEBUG:
    import debug_toolbar
    urlpatterns += [
        path('__debug__/', include(debug_toolbar.urls)),
    ]
 ```

6. Just to be sure we good, check if you see the debug toolbar
 ```
 run python manage.py runserver 0.0.0.0:8000
 
 run python manage.py runserver [::]:8000

 ```

#### 8) React - npm setup
1. Create the node environment
 `run *npm init*`

2. Install npm dependencies
 `run *npm install --save-dev jquery react react-dom webpack webpack-bundle-tracker babel-loader babel-core babel-preset-es2015 babel-preset-react*`

#### 9) Webpack configuration
1. Create folders to hold your React code & your static files
 `run *mkdir -p components/home*`
 `run *mkdir static*`

2. Create config file for Webpack
 ```python
 # webpack.config.js
var path = require('path')
var webpack = require('webpack')
var BundleTracker = require('webpack-bundle-tracker')
module.exports = {
    context: __dirname,
    entry: {
        home: './components/home/index',
    },
    output: {
        path: path.resolve('./static/bundles/'),
        filename: "[name]-[hash].js"
    },
    plugins: [
        new BundleTracker({path: __dirname, filename: './webpack-stats.json'}),
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery'
        }),
    ],
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /(node_modules)/,
                loader: 'babel-loader',
                query: {
                    presets: ['react']
                }
            },
        ]
    },
    resolve: {
        modules: ['node_modules'],
            extensions: ['.js', '.jsx']
    },
}
 ```

3. Test if webpack is configured correctly
 * Write test content
 ```javascript
 # components/home/index.jsx
var React = require('react')
var ReactDOM = require('react-dom')
ReactDOM.render(<h1>Hello, React!<h1>, document.getElementById('container'))
 ```
 * Create bundle
 `run *./node_modules/.bin/webpack --config webpack.config.js*`

#### 10) Integrate webpack in django
1. Install django-webpack-loader
 `run *pip install django-webpack-loader*`

2. Adapt settings
 ```python
 # casiot/settings.py
INSTALLED_APPS = (
    ...
    'webpack_loader',
)
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),
]
TEMPLATES = [
    {
        ...
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        ...
    }
]
WEBPACK_LOADER = {
    'DEFAULT': {
        'BUNDLE_DIR_NAME': 'bundles/',
        'STATS_FILE': os.path.join(BASE_DIR, 'webpack-stats.json'),
    }
}
 ```

3. Create an html template
 ```html
{% load static %}
{% load render_bundle from webpack_loader %}
<!DOCTYPE html>
<html lang="en">
<head>
    <title>This is a test!</title>
</head>
<body>
    <h3>Test</h3>
    <hr>
    <div id="container"></div>
    {% render_bundle 'home'%}
</body>
</html>
 ```

4. Finally, Create the application
 `run *python manage.py startapp interface*`
 Add *interface* to *INSTALLED_APPS*

5. Create a view to link the html to the backed
 ```python
 # interface/views.py 
from django.views.generic import TemplateView
class HomeView(TemplateView):
    template_name = 'home.html'
 ```

6. Link the view to application's URL
 ```python
 # interface/urls.py
from django.urls import path
from interface.views import HomeView
urlpatterns = [
    path('', HomeView.as_view()),
]
 ```

7. Next lets link the app's urls to django's urls
 ```python
 # casiot/urls.py
urlpatterns = [
    ...
    path('', include('interface.urls')),
]
 ```

8. Test
`run *python manage.py runserver 0.0.0.0:8000*`
`run *python manage.py runserver 0.0.0.0:8000*`

### Finish!

## Creating and managing the site

#### 1) Getting the base
1. Adding bootstrap 4
There are 2 ways of getting bootstrap 4 on your html pages. 
 * The easy to write but performance cost way:
 * Add <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/css/bootstrap.min.css" integrity="sha384-rwoIResjU2yc3z8GV/NPeZWAv56rSmLldC3R/AZzGRnGxQQKnKkoFVhFQhNUwEyJ" crossorigin="anonymous">*
 * Add <script src="https://code.jquery.com/jquery-3.1.1.slim.min.js" integrity="sha384-A7FZj7v+d/sdmMqp/nOQwliLvUsJfDHW+k9Omg/a/EheAdgtzNs3hpfag6Ed950n" crossorigin="anonymous"></script>*
 * Add <script src="https://cdnjs.cloudflare.com/ajax/libs/tether/1.4.0/js/tether.min.js" integrity="sha384-DztdAPBWPRXSA/3eYEEUWrWCy7G5KFbe8fFjk5JAIxUYHKkDx6Qin1DkWx51bBrb" crossorigin="anonymous"></script>*
 * Add <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/js/bootstrap.min.js" integrity="sha384-vBWWzlZJ8ea9aCX4pEW3rVHjgjt7zpkNpZk+02D9phzyeVkE+jo0ieGizqPLForn" crossorigin="anonymous"></script>*

 * The harded to write but better performance way:
 Download the minified versions of bootstrap4 to your *static/third_party/bootstrap/* folder
 * Add <link rel="stylesheet" href={% static "third_party/bootstrap/css/bootstrap.min.css" %}>*
 * Add <script src={% static "third_party/bootstrap/js/jquery-3.3.1.min.js" %}></script>*
 * Add <script src={% static "third_party/bootstrap/js/tether.min.js" %}></script>*
 * Add <script src={% static "third_party/bootstrap/js/bootstrap.min.js" %}></script>*

2. Create *base.html*
 ```html
<!-- templates/base.html -->
{% load static %}
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="description" content="Cascoda - Open Thread - Demo">
    <meta name="author" content="Andrei Alexandru">
    <!-- Bootstrap core CSS -->
    <link rel="stylesheet" href={% static "third_party/bootstrap/css/bootstrap.min.css" %}>
    <!-- Custom Style -->
    {% block additional_head %}
    {% endblock %}
</head>
<body>
    <!-- Main Content -->
    {% block main_content %}
    {% endblock %}
    <!-- Footer Content -->
    <footer class="footer">
        <div class="container text-center">
            <span class="text-muted">&copy; <a class="text-muted" href="http://www.cascoda.com/">CASCODA LTD.</a> 2018</span>
        </div>
    </footer>
    <!-- Bootstrap core JavaScript -->
    <script src={% static "third_party/bootstrap/js/jquery-3.3.1.min.js" %}></script>
    <script src={% static "third_party/bootstrap/js/tether.min.js" %}></script>
    <script src={% static "third_party/bootstrap/js/bootstrap.min.js" %}></script>
    <!-- Additional JavaScript -->
    {% block additional_js %}
    {% endblock %}
</body>
</html>
 ```

3. Edit *home.html* and test if everything worked out
```html
{% load static %}
{% load render_bundle from webpack_loader %}

{% extends "base.html" %}

{% block main_content %}
    <h3>Home</h3>
    <hr>
    <div id="container">Cry Baby Cry!</div>
{% endblock %}

{% block additional_js %}
    {% render_bundle 'home' %}
{% endblock %}

```

#### 2) User Registration
I don't know who you are, but if you want a proper site&server that provide valuable information to the users, you must have an accounting system
The thing is that the accounting part has really no connection to the application part except for privileges to access it. So we might as well separate the accounting bit of our server and also keep it clean by using Django's default accounting system. 
1. Add the following to your server's urls and Django will take care of User Registration
```python
# casiot/urls.py
...
from django.views.generic.edit import CreateView
from django.contrib.auth.forms import UserCreationForm
...
urlpatterns = [
...
path('register/', CreateView.as_view(template_name='account/register.html', form_class=UserCreationForm, success_url='/')),
]
```
2. Provide a *register.html*
```html
{% extends "../base.html" %}

{% block additional_head %}
<link rel="stylesheet" href={% static "css/register.css" %}>
{% endblock %}

{% block main_content %}
<div class="container">
    <h2 class="text-center">Register to Demo</h2>
    <br>
    <form method="post">
        {% csrf_token %}
        {% for field in form %}
        <div class="form-group row justify-content-start no-gutters">
            <label class="col-3 text-info">{{ field.label }}</label>
            <div class="col-9 align-self-start">
                {{ field }}
                {% if field.errors %}
                <br>
                <p class="text-danger">
                    {% for error in field.errors %}
                        {{ error }}
                    {% endfor %}
                </p>
                {% endif %}
            </div>
        </div>
        {% endfor %}
        <div class="form-group row justyify-content-start no-gutters">
            <div class="col-3">
            </div>
            <div class="col-9 align-self-start">
                <button type="submit" class="btn btn-primary">Register</button>
            </div>
        </div>
    </form>
</div>
{% endblock %}
```

#### 3) User Login
Again we are going to use django's defaults.
1. Add the following to your server's urls
```python
# casiot/urls.py
...
from django.contrib.auth.views import LoginView
...
urlpatterns = [
...
path('login/', LoginView.as_view(template_name='account/login.html')),
]
```

2. Create the template *login.html*
```html
{% extends "../base.html" %}
{% load static %}

{% block additional_head %}
        <link rel="stylesheet" href={% static "css/login.css" %}>
{% endblock %}

{% block main_content %}
<div class="container">
    <h1 class="text-center">Login to Demo</h1>
    <br>
    <form method="post">
        {% csrf_token %}
        {% for field in form %}
        <div class="form-group row justify-content-start no-gutters">
            <label class="col-3">{{ field.label }}</label>
            <div class="col-9 align-self-start">
                {{ field }}
                {% if field.errors %}
                <br>
                <p class="text-danger">
                    {% for error in field.errors %}
                        {{ error }}
                    {% endfor %}
                </p>
                {% endif %}
            </div>
        </div>
        {% endfor %}
        <div class="form-group row justyify-content-start no-gutters">
            <div class="col-3">
            </div>
            <div class="col-9 align-self-start">
                <button type="submit" class="btn btn-primary">Login</butto$
            </div>
        </div>
    </form>
</div>
{% endblock %}
```

3. Login is a bit different and needs some settings as well to redirect accordingly
```python
# casiot/settings.py
LOGIN_REDIRECT_URL = '/'
```

#### 4) User Logout
Very simple - same as above
1. Add the following to your server's urls
```python
# casiot/urls.py
...
from django.contrib.auth.views import LogoutView
...
urlpatterns = [
...
path('logout/', LogoutView.as_view()),
]
```

2. Add Logout redirect at settings
```python
# casiot/settings.py
LOGOUT_REDIRECT_URL = '/login/'
```
3. To test this add a logout button at *home.html*
```html
<a href="/logout/" class="btn btn-info" role="button">Logout</a>
```