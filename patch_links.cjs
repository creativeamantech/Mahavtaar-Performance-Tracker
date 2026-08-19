const fs = require('fs');

// TeamPivot.tsx
let teamCode = fs.readFileSync('src/pages/TeamPivot.tsx', 'utf-8');
if (!teamCode.includes("import { Link } from 'react-router-dom';")) {
  teamCode = teamCode.replace(
    "import { Download } from 'lucide-react';",
    "import { Download } from 'lucide-react';\nimport { Link } from 'react-router-dom';"
  );
}
teamCode = teamCode.replace(
  "{ key: 'exec', label: 'Executive', render: (v: string) => <span className=\"font-medium\">{v}</span> },",
  "{ key: 'exec', label: 'Executive', render: (v: string, row: any) => <Link to={`/explorer?executive=${encodeURIComponent(v)}&bucket=${encodeURIComponent(row.bkt)}`} className=\"font-medium text-primary hover:underline\">{v}</Link> },"
);
fs.writeFileSync('src/pages/TeamPivot.tsx', teamCode);

// CityPivot.tsx
let cityCode = fs.readFileSync('src/pages/CityPivot.tsx', 'utf-8');
if (!cityCode.includes("import { Link } from 'react-router-dom';")) {
  cityCode = cityCode.replace(
    "import { Download } from 'lucide-react';",
    "import { Download } from 'lucide-react';\nimport { Link } from 'react-router-dom';"
  );
}
cityCode = cityCode.replace(
  "{ key: 'city', label: 'City', render: (v: string) => <span className=\"font-medium\">{v}</span> },",
  "{ key: 'city', label: 'City', render: (v: string) => <Link to={`/explorer?city=${encodeURIComponent(v)}`} className=\"font-medium text-primary hover:underline\">{v}</Link> },"
);
fs.writeFileSync('src/pages/CityPivot.tsx', cityCode);

// Dashboard.tsx (City Snapshot)
let dashCode = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');
dashCode = dashCode.replace(
  '<td className="p-3 text-foreground font-semibold">{city.city}</td>',
  '<td className="p-3 text-primary font-semibold hover:underline"><Link to={`/explorer?city=${encodeURIComponent(city.city)}`}>{city.city}</Link></td>'
);
fs.writeFileSync('src/pages/Dashboard.tsx', dashCode);

console.log('Links patched');
