const BluetoothSerialPort = require('bluetooth-serial-port').BluetoothSerialPort;

// Replace with your LED's Bluetooth MAC address
const ledMacAddress = 'FF:10:10:98:76:76';  // Example MAC address

const btSerial = new BluetoothSerialPort();

// Step 1: Directly Connect to the LED using MAC address
function connectToLED(macAddress) {
    btSerial.connect(macAddress, 1, (err) => {
        if (err) {
            console.error('❗ Connection failed:', err);
            return;
        }

        console.log(`🔗 Successfully connected to LED at ${macAddress}`);

        // Step 2: Start listening for incoming data
        btSerial.on('data', (data) => {
            console.log(`📥 Data received: ${data.toString('utf-8')}`);
        });

        // Handle disconnection
        btSerial.on('closed', () => {
            console.log('❗ Disconnected from LED');
        });
    });
}

// Step 3: Attempt to connect to the LED directly
connectToLED(ledMacAddress);
