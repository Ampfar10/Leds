const noble = require('noble'); // Updated to use 'noble'
const readline = require('readline');

let devices = [];

// CLI interface for selecting a device
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Step 1: Scan for Devices
noble.on('stateChange', (state) => {
    if (state === 'poweredOn') {
        console.log('🔍 Scanning for Bluetooth devices... (Press CTRL+C to stop)');
        noble.startScanning([], true); // Scans for all devices
    } else {
        noble.stopScanning();
    }
});

// Step 2: List Devices
noble.on('discover', (peripheral) => {
    const deviceInfo = `${devices.length + 1}) ${peripheral.advertisement.localName || 'Unknown'} - ${peripheral.address}`;
    
    if (!devices.some((dev) => dev.address === peripheral.address)) {
        devices.push(peripheral);
        console.log(deviceInfo);
    }
});

// Step 3: Ask User to Select a Device
function selectDevice() {
    rl.question('\n🔹 Select a device by number: ', (choice) => {
        const index = parseInt(choice) - 1;

        if (index >= 0 && index < devices.length) {
            const selectedDevice = devices[index];
            console.log(`\n✅ Selected device: ${selectedDevice.advertisement.localName || 'Unknown'} (${selectedDevice.address})`);
            noble.stopScanning();

            connectToDevice(selectedDevice);
        } else {
            console.log('❌ Invalid choice. Please try again.');
            selectDevice();
        }
    });
}

// Step 4: Connect and Listen for Data
function connectToDevice(peripheral) {
    peripheral.connect((error) => {
        if (error) {
            console.error('❗ Connection failed:', error);
            return;
        }

        console.log(`🔗 Connected to ${peripheral.address}`);
        
        // Discover available services and characteristics
        peripheral.discoverAllServicesAndCharacteristics((error, services, characteristics) => {
            if (error) {
                console.error('❗ Error discovering services:', error);
                return;
            }

            console.log('📡 Listening for data...');

            characteristics.forEach((char) => {
                if (char.properties.includes('notify')) {
                    char.subscribe((error) => {
                        if (error) {
                            console.error('❗ Error subscribing to notifications:', error);
                        } else {
                            console.log(`🔔 Subscribed to characteristic: ${char.uuid}`);
                        }
                    });

                    char.on('data', (data) => {
                        console.log(`📥 Data received: ${data.toString('hex')}`);
                    });
                }
            });
        });
    });
}

// Delay to allow devices to populate before selection
setTimeout(() => {
    noble.stopScanning();
    if (devices.length === 0) {
        console.log('❌ No devices found. Try again.');
        process.exit();
    }
    selectDevice();
}, 10000);  // Scans for 10 seconds
                            
