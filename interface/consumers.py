from channels.generic.websocket import AsyncJsonWebsocketConsumer
from interface.models import Device

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
		print(command)

		if command == "cmd-ci":
			dev_id = content.get("id", None)
			name = content.get("name", None)
			info = content.get("info", None)

			device = Device.objects.get(id=dev_id)

			if device:
				device.name = name
				device.info = info
				device.save()

		if command == "cmd-ti":
			dev_id = content.get("id", None)
			timer = content.get("timer", None)

			device = Device.objects.get(id=dev_id)

			if device:
				device.timer = timer
				device.save()

		if command == "cmd-th":
			dev_id = content.get("id", None)
			th_min = content.get("th_min", None)
			th_max = content.get("th_max", None)

			device = Device.objects.get(id=dev_id)

			if device:
				device.th_min = th_min
				device.th_max = th_max
				device.save()

		if command == "cmd-LED":
			dev_id = content.get("id", None)

			device = Device.objects.get(id=dev_id)

			if device:
				print("MUST SEND LED COMMAND TO DEVICE")
				print(device.id)


	"""
	Before ws closes do something
	"""
	async def disconnect(self, code):
		# Remove the user from the group
		await self.channel_layer.group_discard("cas_dev_list", self.channel_name)
		pass

	async def dev_list_update(self, event):
		await self.send_json({"text": "received an updated dev_list"},)