const BluetoothSerialPort = require('bluetooth-serial-port').BluetoothSerialPort;
const readline = require('readline');

let devices = [];

// CLI interface for selecting a device
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Create a new Bluetooth serial port instance
const btSerial = new BluetoothSerialPort();

// Step 1: Scan for Devices
function startScanning() {
    console.log('🔍 Scanning for Bluetooth devices... (Press CTRL+C to stop)');
    btSerial.on('found', (address, name) => {
        const deviceInfo = `${devices.length + 1}) ${name || 'Unknown'} - ${address}`;
        
        // Avoid adding duplicate devices
        if (!devices.some(dev => dev.address === address)) {
            devices.push({ address, name });
            console.log(deviceInfo);
        }
    });

    // Start the scanning process
    btSerial.inquire();
}

// Step 2: List Devices
function selectDevice() {
    rl.question('\n🔹 Select a device by number: ', (choice) => {
        const index = parseInt(choice) - 1;

        if (index >= 0 && index < devices.length) {
            const selectedDevice = devices[index];
            console.log(`\n✅ Selected device: ${selectedDevice.name || 'Unknown'} (${selectedDevice.address})`);
            btSerial.cancelInquiry();  // Stop scanning

            connectToDevice(selectedDevice);
        } else {
            console.log('❌ Invalid choice. Please try again.');
            selectDevice();
        }
    });
}

// Step 3: Connect and Listen for Data
function connectToDevice(selectedDevice) {
    btSerial.connect(selectedDevice.address, 1, (err) => {
        if (err) {
            console.error('❗ Connection failed:', err);
            return;
        }

        console.log(`🔗 Connected to ${selectedDevice.address}`);

        // Start listening for incoming data
        btSerial.on('data', (data) => {
            console.log(`📥 Data received: ${data.toString('utf-8')}`);
        });

        // Handle disconnection
        btSerial.on('closed', () => {
            console.log('❗ Disconnected from device');
        });
    });
}

// Step 4: Start Scanning and Device Selection
setTimeout(() => {
    if (devices.length === 0) {
        console.log('❌ No devices found. Try again.');
        process.exit();
    }
    selectDevice();
}, 10000);  // Scans for 10 seconds

// Begin scanning for devices
startScanning();
