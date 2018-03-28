import logging
import asyncio
from aiocoap import *

import aiocoap.resource as resource
import aiocoap

logging.basicConfig(level=logging.INFO)

DEVICE_KEY = 'coap_dev_test'
DEVICE_ID = None

"""
Example to register Device
"""
async def sendRegisterCoAPMessage():
	protocol = await Context.create_client_context()

	request_reg_id = Message(code=GET, uri='coap://192.168.10.201:5683/dev', payload=DEVICE_KEY.encode('utf8'))

	try: 
		response = await protocol.request(request_reg_id).response
	except Exception as e:
		print('Failed to send message')
		print(e)
	else:
		print('Result: %s\n%r'%(response.code, response.payload))

	DEVICE_ID = response.payload.decode('utf8')
	print(DEVICE_ID)

"""
Example to update Device value
"""
async def sendUpdateCoAPMessage():
	protocol = await Context.create_client_context()

	new_val = 40
	DEVICE_ID = 3
	request_update_value = Message(code=PUT, uri='coap://192.168.10.201:5683/dev/{0}'.format(DEVICE_ID), payload=str(new_val).encode('utf8'))

	try: 
		response = await protocol.request(request_update_value).response
	except Exception as e:
		print('Failed to send message')
		print(e)
	else:
		print(response.payload.decode('utf8'))


async def main():
    await sendUpdateCoAPMessage()

if __name__ == "__main__":
    asyncio.get_event_loop().run_until_complete(main())