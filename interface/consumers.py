from channels.generic.websocket import AsyncJsonWebsocketConsumer

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

	"""
	Before ws closes do something
	"""
	async def disconnect(self, code):
		# Remove the user from the group
		await self.channel_layer.group_discard("cas_dev_list", self.channel_name)
		pass

	async def dev_list_update(self, event):
		await self.send_json({"text": "received an updated dev_list"},)