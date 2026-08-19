const fs = require('fs');

const path = 'src/pages/DataEntry.tsx';
let code = fs.readFileSync(path, 'utf-8');

if (!code.includes('AGREEMENTNO: String(row.agreement_no')) {
    // we need to see how DataEntry processes the file. 
}

console.log('checked data entry');
