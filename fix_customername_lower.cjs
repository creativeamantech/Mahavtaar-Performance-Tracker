const fs = require('fs');

const path = 'src/lib/fileParser.ts';
let code = fs.readFileSync(path, 'utf-8');

code = code.replace(
  "customer_name: String(row['CUSTOMERNAME'] || row['Customer Name'] || row['CUSTOMER_NAME'] || row['customer_name'] || '').trim(),",
  "customer_name: String(row['CUSTOMERNAME'] || row['Customer Name'] || row['CUSTOMER_NAME'] || row['customer_name'] || row['customername'] || '').trim(),"
);

fs.writeFileSync(path, code);
console.log('Fixed file parser customername lowercase');
