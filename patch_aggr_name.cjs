const fs = require('fs');

const path = 'src/pages/DataExplorer.tsx';
let code = fs.readFileSync(path, 'utf-8');

code = code.replace(
  "r.agreement_no || r.AGREEMENTNO || r['AGREEMENTNO'] || r['Agreement No'] || r.agreement_number || r.AGREEMENT_NO || r.loan_id || r.LOAN_ID || '-'",
  "r.agreement_no || r.AGREEMENTNO || r['AGREEMENTNO'] || r['Agreement No'] || r.agreement_number || r.AGREEMENT_NO || r.loan_id || r.LOAN_ID || r['Agreement ID'] || r.AGREEMENT_ID || r.Id || r.id || '-'"
);

code = code.replace(
  "r.customer_name || r['CUSTOMERNAME'] || '-'",
  "r.customer_name || r['CUSTOMERNAME'] || r['Customer Name'] || r.CUSTOMER_NAME || r.name || r.Name || '-'"
);

fs.writeFileSync(path, code);
console.log('Fixed aggr and name.');
