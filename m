import asyncio
from bleak import BleakScanner, BleakClient

# Step 1: Scan for BLE devices
async def scan_for_devices():
    print("🔍 Scanning for nearby BLE devices for 30 seconds...")
    devices = await BleakScanner.discover()

    if devices:
        print("\n🔹 Found devices:")
        for i, device in enumerate(devices, 1):
            print(f"{i}) {device.name or 'Unknown'} - {device.address}")
    else:
        print("❌ No devices found.")
    return devices

# Step 2: Notification handler to print incoming data
def notification_handler(sender, data):
    print(f"\n📡 Data received from {sender}:")
    print(f"🔹 Hex Data: {data.hex()}")
    print(f"🔹 Raw Data: {data}")
    
    try:
        decoded_text = data.decode('utf-8', errors='ignore')
        print(f"🔹 Decoded Text: {decoded_text}")
    except Exception as e:
        print(f"❗ Could not decode text: {e}")

# Step 3: Connect to selected device and listen for data
async def connect_to_led(mac_address):
    async with BleakClient(mac_address) as client:
        print(f"✅ Connected to {mac_address}")

        # Discover available services and characteristics
        services = await client.get_services()

        for service in services:
            for char in service.characteristics:
                if 'notify' in char.properties:
                    print(f"🔔 Subscribing to characteristic: {char.uuid}")
                    await client.start_notify(char.uuid, notification_handler)

        print("📡 Listening for data... Press CTRL+C to stop.")
        await asyncio.Future()  # Keep the program running

# Step 4: Main Logic
async def main():
    devices = await scan_for_devices()

    if not devices:
        print("❌ No devices found. Exiting...")
        return

    selected_index = int(input("\n🔹 Select a device by number: ")) - 1
    if selected_index < 0 or selected_index >= len(devices):
        print("❌ Invalid choice. Exiting...")
        return

    selected_device = devices[selected_index]
    print(f"\n✅ You selected: {selected_device.name or 'Unknown'} ({selected_device.address})")

    await connect_to_led(selected_device.address)

asyncio.run(main())
