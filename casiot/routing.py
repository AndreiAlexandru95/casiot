from django.urls import path

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack

from interface.consumers import DeviceConsumer

application = ProtocolTypeRouter({
	"websocket": AuthMiddlewareStack(
		URLRouter([
			path("devices/", DeviceConsumer),
		]),
	),
})