const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function startScanner() {
    console.log('--- WMSU RFID Terminal Simulator ---');
    rl.question('AWAITING RFID SCAN: ', (idNumber) => {
        if (!idNumber.trim()) {
            console.log('Error: No ID detected. Please try again.');
            return startScanner();
        }

        console.log(Scan Recorded for ID: [${idNumber.trim()}]);
        rl.close();
    });
}

startScanner();
