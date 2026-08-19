const fs = require('fs');

const path = 'src/pages/TeamPivot.tsx';
let code = fs.readFileSync(path, 'utf-8');

// The user mentioned "if we look at the data by the team's data, the data shows in bits."
// Because we were passing '&bucket=' in the Team Pivot link, they only see one bucket at a time when they click the executive.
// Let's remove the bucket parameter so clicking the executive shows ALL their buckets at once.
code = code.replace(
  "row.bkt)}`} className",
  "row.bkt)}`} className" // Wait, I need to properly replace this. Let's just rewrite the line.
);

code = code.replace(
  "{ key: 'exec', label: 'Executive', render: (v: string, row: any) => <Link to={`/explorer?executive=${encodeURIComponent(v)}&bucket=${encodeURIComponent(row.bkt)}`} className=\"font-medium text-primary hover:underline\">{v}</Link> },",
  "{ key: 'exec', label: 'Executive', render: (v: string) => <Link to={`/explorer?executive=${encodeURIComponent(v)}`} className=\"font-medium text-primary hover:underline\">{v}</Link> },"
);

fs.writeFileSync(path, code);
console.log('Fixed Team Pivot link to show all buckets.');
