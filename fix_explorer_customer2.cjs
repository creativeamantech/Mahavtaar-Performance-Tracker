const fs = require('fs');

const path = 'src/pages/DataExplorer.tsx';
let code = fs.readFileSync(path, 'utf-8');

code = code.replace(
  "r.customer_name || r.CUSTOMERNAME || '-'",
  "r.customer_name || r.CUSTOMERNAME || r['Customer Name'] || r.CUSTOMER_NAME || '-'"
);

fs.writeFileSync(path, code);
console.log('Fixed explorer customer name mapping');
