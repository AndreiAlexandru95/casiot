from channels.generic.websocket import AsyncJsonWebsocketConsumer

class DeviceConsumer(AsyncJsonWebsocketConsumer):
	"""
	When ws handshaking takes place
	Make sure you accept connections just from registered users
	"""
	async def connect(self):
		if self.scope["user"].is_anonymous:
			await self.close()
		else:
			# Add the user to group if logged in
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
		pass