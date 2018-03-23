from django.utils import timezone
import datetime
import logging

import asyncio
import aiocoap.resource as resource
import aiocoap
from aiocoap import *

import os
import django
from django.conf import settings

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "casiot.settings")
django.setup()


from interface.serializers import *
from interface.models import *

from channels.layers import get_channel_layer

channel_layer = get_channel_layer()

class DeviceResource(resource.Resource, resource.PathCapable):

	def __init__(self):
		super(DeviceResource, self).__init__()
		self.content = ''.encode('ascii')

	async def render_get(self, request):
		if request.payload:
			device_key = request.payload.decode('utf8')
			admin = User.objects.get(username='admin')
			device = Device.create_update_device(device_key=device_key, user=admin)
			
			return aiocoap.Message(payload=device_id.encode('utf8'))

	async def render_put(self, request):
		device_id = int(request.opt.uri_path[0])
		value = float(request.payload.decode('utf8'))

		dev_ip_addr = request.remote.sockaddr[0]
		updated_device = Device.get_device_by_id(id=device_id)

		updated_device.update_value(value=value, ip_addr=dev_ip_addr, error=False)

		return aiocoap.Message(payload=request.payload)

class MessageResource(resource.Resource, resource.PathCapable):

	def __init__(self):
		super(MessageResource, self).__init__()
		self.content = ''.encode('ascii')

	async def render_put(self, request):

		device_id = int(request.opt.uri_path[1])
		message_text = request.payload.decode('utf8')
		message_type = request.opt.uri_path[0]

		updated_device = Device.get_device_by_id(id=device_id)

		if message_type == 'inf':
			message_type = DeviceLog.INF
		elif message_type == 'err':
			message_type = DeviceLog.ERR
		elif message_type == 'war':
			message_type = DeviceLog.WAR
		elif message_type == 'dbg':
			message_type = DeviceLog.DBG

		updated_device.add_log(mess_type=message_type, text=message_text)

		return aiocoap.Message(payload=request.payload)

logging.basicConfig(level=logging.INFO)
logging.getLogger("coap-server").setLevel(logging.DEBUG)

loop = asyncio.get_event_loop()

def main():
	root = resource.Site()
	root.add_resource(('.well-known', 'core'), resource.WKCResource(root.get_resources_as_linkheader))
	root.add_resource(('dev',), DeviceResource())
	root.add_resource(('msg',), MessageResource())

	asyncio.Task(aiocoap.Context.create_server_context(root))
	loop.run_forever()

if __name__ == "__main__":
	main()
