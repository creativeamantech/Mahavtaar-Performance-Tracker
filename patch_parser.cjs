const fs = require('fs');

const path = 'src/lib/fileParser.ts';
let code = fs.readFileSync(path, 'utf-8');

// The fileParser.ts Maps the main file upload into exact properties.
// It seems it missed picking up the raw agreement number (customer facing) and the customer name 
// when mapping from the raw upload (the sheet_to_json result).
// The Explorer relies on `r.agreement_no` and `r.customer_name` but they were dropped in the mapping!

code = code.replace(
  "agreementid: String(row['agreementid'] || row['AGREEMENTID'] || '').trim(),",
  "agreementid: String(row['agreementid'] || row['AGREEMENTID'] || '').trim(),\n    agreement_no: String(row['AGREEMENTNO'] || row['AGREEMENT_NO'] || row['Agreement No'] || row['agreement_no'] || row['loan_id'] || '').trim(),\n    customer_name: String(row['CUSTOMERNAME'] || row['Customer Name'] || row['CUSTOMER_NAME'] || row['customer_name'] || row['Name'] || row['name'] || '').trim(),"
);

fs.writeFileSync(path, code);
console.log('Fixed file parser mapping.');
