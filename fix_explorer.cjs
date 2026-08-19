const fs = require('fs');

const path = 'src/pages/DataExplorer.tsx';
let code = fs.readFileSync(path, 'utf-8');

// The primary key in the app is `agreementid` which comes from `AGREEMENTID`.
// We should render `r.agreementid` first.
code = code.replace(
  "r.agreement_no || r.AGREEMENTNO || r['AGREEMENTNO'] || r['Agreement No'] || r.agreement_number || r.AGREEMENT_NO || r.loan_id || r.LOAN_ID || r['Agreement ID'] || r.AGREEMENT_ID || r.Id || r.id || '-'",
  "r.agreementid || r.agreement_no || r.AGREEMENTNO || r.AGREEMENTID || '-'"
);

fs.writeFileSync(path, code);
console.log('Fixed explorer to use agreementid');
