const fs = require('fs');
const content = fs.readFileSync('on-chain/contracts/src/Verifier.sol', 'utf8');
const lines = content.split('\n');

const regex = /^\s+\w+\[\] \w+ =/ ;

lines.forEach((line, index) => {
    if (regex.test(line) && !line.includes('memory') && !line.includes('storage') && !line.includes('calldata')) {
        console.log(`Line ${index + 1}: ${line.trim()}`);
    }
});
