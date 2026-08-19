const fs = require('fs');

const path = 'src/pages/DataExplorer.tsx';
let code = fs.readFileSync(path, 'utf-8');

// The agreement number might be 'AGREEMENTNO', 'AGREEMENT_NO', 'agreement_no', 'Agreement No', 'Agreement ID'. 
// Let's modify DataExplorer to pull all possible keys dynamically for this field:
code = code.replace(
  "r.agreement_no || r['AGREEMENTNO'] || '-'",
  "r.agreement_no || r.AGREEMENTNO || r['AGREEMENTNO'] || r['Agreement No'] || r.agreement_number || r.AGREEMENT_NO || r.loan_id || r.LOAN_ID || '-'"
);

fs.writeFileSync(path, code);
console.log('Fixed Agreement Number mapping.');
