import asyncio
from bleak import BleakClient
import time

# List to store discovered devices
devices = []

# Bluetooth MAC address of the LED device
LED_MAC_ADDRESS = None  # Initially set to None; user will select this

# This is the callback function that handles incoming data
def notification_handler(sender, data):
    print(f"📥 Data received from {sender}: {data.hex()}")

# Step 1: Scan for BLE devices for 30 seconds
async def scan_for_devices():
    global devices
    print("🔍 Scanning for nearby BLE devices for 30 seconds...")

    # Start scanning for BLE devices
    async with BleakClient() as client:
        devices = await client.discover()  # Discover all devices

    # Print the list of discovered devices
    if devices:
        print("🔹 Found devices:")
        for i, device in enumerate(devices, 1):
            print(f"{i}) {device.name} - {device.address}")
    else:
        print("❌ No devices found.")

    return devices

# Step 2: Allow the user to select the device to connect to
async def select_device():
    global LED_MAC_ADDRESS
    while not LED_MAC_ADDRESS:
        try:
            choice = int(input("\n🔹 Select a device by number: ")) - 1
            if 0 <= choice < len(devices):
                LED_MAC_ADDRESS = devices[choice].address
                print(f"✅ You selected: {devices[choice].name} ({LED_MAC_ADDRESS})")
            else:
                print("❌ Invalid choice, try again.")
        except ValueError:
            print("❌ Invalid input. Please enter a number.")

# Step 3: Connect to the selected device and start listening
async def connect_to_led(mac_address):
    async with BleakClient(mac_address) as client:
        # Check if connection was successful
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

                # Subscribe to notifications if the characteristic supports 'notify'
                if 'notify' in characteristic.properties:
                    print(f"  Subscribing to notifications on {characteristic.uuid}")
                    try:
                        await client.start_notify(characteristic, notification_handler)
                    except Exception as e:
                        print(f"❗ Failed to subscribe to {characteristic.uuid}: {e}")

        # Keep the script running to listen for notifications
        print("📡 Listening for data... Press CTRL+C to stop.")
        await asyncio.Future()  # Keeps the script running

# Main function to orchestrate the steps
async def main():
    # Step 1: Scan for devices for 30 seconds
    devices = await scan_for_devices()

    # Step 2: Allow the user to select the device
    if devices:
        await select_device()
    
    # Step 3: Connect to the selected LED device and listen for notifications
    if LED_MAC_ADDRESS:
        await connect_to_led(LED_MAC_ADDRESS)

# Run the main function
asyncio.run(main())
