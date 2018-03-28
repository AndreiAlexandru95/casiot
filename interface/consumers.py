from channels.generic.websocket import AsyncJsonWebsocketConsumer
from interface.models import Device, DeviceLog
from django.contrib.auth.models import User
import datetime
import aiocoap

class DeviceConsumer(AsyncJsonWebsocketConsumer):
	groups = ["cas_dev_list",]
	"""
	When ws handshaking takes place
	Make sure you accept connections just from registered users
	"""
	async def connect(self):
		if self.scope["user"].is_anonymous:
			await self.close()
		else:
			# Add the user to group if logged in
			await self.channel_layer.group_add("cas_dev_list", self.channel_name)
			await self.accept()

	"""
	When ws receives a text frame
	"""
	async def receive_json(self, content):
		command = content.get("command", None)

		if command == "cmd-ci":
			dev_id = content.get("id", None)
			name = content.get("name", None)
			info = content.get("info", None)

			device = Device.objects.get(id=dev_id)

			if device:
				device.name = name
				device.info = info
				device.save()
				device.add_log(DeviceLog.INFO, 'SET name {0}'.format(name), datetime.datetime.now())
				device.add_log(DeviceLog.INFO, 'SET description {0}'.format(info), datetime.datetime.now())
				await self.channel_layer.group_send("cas_dev_list", {"type": "dev_info.update"})

		if command == "cmd-ti":
			dev_id = content.get("id", None)
			timer = content.get("timer", None)

			device = Device.objects.get(id=dev_id)

			if device:
				device.timer = timer
				device.save()
				device.add_log(DeviceLog.INFO, 'SET timer {0}'.format(timer), datetime.datetime.now())
				await self.channel_layer.group_send("cas_dev_list", {"type": "dev_info.update"})

		if command == "cmd-th":
			dev_id = content.get("id", None)
			th_min = content.get("th_min", None)
			th_max = content.get("th_max", None)

			device = Device.objects.get(id=dev_id)

			if device:
				device.th_min = th_min
				device.th_max = th_max
				device.save()
				device.add_log(DeviceLog.INFO, 'SET min threshold {0}'.format(th_min), datetime.datetime.now())
				device.add_log(DeviceLog.INFO, 'SET max threshold {0}'.format(th_max), datetime.datetime.now())
				await self.channel_layer.group_send("cas_dev_list", {"type": "dev_info.update"})

		if command == "cmd-LED":
			dev_id = content.get("id", None)

			device = Device.objects.get(id=dev_id)

			if device:
				device.add_log(DeviceLog.INFO, 'SEND command {0}'.format(command[-3:]), datetime.datetime.now())
				await self.channel_layer.group_send("cas_dev_list", {"type": "dev_info.update"})
				await self.sendCoAPMessage("[192.168.10.254]", "test", "/path/")

		if command == "cmd-sn":
			dev_key = content.get("dev_key", None)
			signer = content.get("user", None)

			device = Device.objects.get(dev_key=dev_key)
			user = User.objects.get(username=signer)
			device.sign_device(user)
			await self.channel_layer.group_send("cas_dev_list", {"type": "dev_list.update"})

		if command == "cmd-fl_db":

			Device.objects.all().delete()
			await self.channel_layer.group_send("cas_dev_list", {"type": "dev_list.update"})



	"""
	Before ws closes do something
	"""
	async def disconnect(self, code):
		# Remove the user from the group
		await self.channel_layer.group_discard("cas_dev_list", self.channel_name)
		pass

	"""
	Private function to notify of update
	"""
	async def dev_list_update(self, event):
		await self.send_json({"text": "received an updated dev_list"},)

	"""
	Private function to notify of update
	"""
	async def dev_info_update(self, event):
		await self.send_json({"text": "received an updated device"},)

	"""
	Private function to send CoAP message to an address
	"""
	async def sendCoAPMessage(self, address, payload, path):
		context = await aiocoap.Context.create_client_context()
		request = aiocoap.Message(code=aiocoap.PUT, payload=payload.encode('utf8'))
		request.opt.uri_host = address
		request.opt.uri_path = path
		request.opt.uri_port = 5683
		response = await context.request(request).response
