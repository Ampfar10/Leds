import asyncio
from bleak import BleakClient

# Replace with your LED's Bluetooth MAC address
LED_MAC_ADDRESS = "FF:10:10:98:76:76"  # Example MAC address

# This is an async function that connects to the LED
async def connect_to_led(mac_address):
    async with BleakClient(mac_address) as client:
        # Check if the connection was successful
        if not client.is_connected:
            print(f"❗ Failed to connect to {mac_address}")
            return
        
        print(f"🔗 Connected to LED at {mac_address}")

        # Discover available services and characteristics
        services = await client.get_services()
        for service in services:
            print(f"Service: {service.uuid}")
            for characteristic in service.characteristics:
                print(f"  Characteristic: {characteristic.uuid} - Properties: {characteristic.properties}")

                # Subscribe to notifications if the characteristic supports notifications
                if 'notify' in characteristic.properties:
                    print(f"  Subscribing to notifications on {characteristic.uuid}")
                    await client.start_notify(characteristic, notification_handler)

        # Keep the script running to listen for notifications
        print("Listening for data... Press CTRL+C to stop.")
        await asyncio.Future()  # Keeps the script running

# This is the callback that handles received data
def notification_handler(sender, data):
    print(f"📥 Data received from {sender}: {data.hex()}")

# Run the async function to connect and listen
asyncio.run(connect_to_led(LED_MAC_ADDRESS))
