const fs = require('fs');

const path = 'src/pages/DataExplorer.tsx';
let code = fs.readFileSync(path, 'utf-8');

const sheetRegex = /<Sheet open=\{\!\!selectedRecord\}[\s\S]*?<\/Sheet>/g;
const matches = code.match(sheetRegex);

if (matches && matches.length > 0) {
  const sheetContent = matches[0];
  // Remove all instances
  code = code.replace(sheetRegex, '');
  
  // Add it back right before the LAST </AppLayout>
  const lastIndex = code.lastIndexOf('</AppLayout>');
  code = code.substring(0, lastIndex) + sheetContent + '\n    ' + code.substring(lastIndex);
  
  fs.writeFileSync(path, code);
  console.log('Fixed sheet position');
} else {
  console.log('Sheet not found');
}
