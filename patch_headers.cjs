const fs = require('fs');

// Desktop Header
let codeDesktop = fs.readFileSync('src/components/layout/DesktopHeader.tsx', 'utf-8');
codeDesktop = codeDesktop.replace("import { useMemo } from 'react';", "import { useMemo } from 'react';\nimport { ThemeToggle } from '../ThemeToggle';");
codeDesktop = codeDesktop.replace(
  '<button className="p-2 hover:bg-muted rounded-full transition-colors text-primary">\n          <UserCircle className="h-7 w-7" />\n        </button>',
  '<ThemeToggle />\n        <button className="p-2 hover:bg-muted rounded-full transition-colors text-primary">\n          <UserCircle className="h-7 w-7" />\n        </button>'
);
fs.writeFileSync('src/components/layout/DesktopHeader.tsx', codeDesktop);

// Mobile Header
let codeMobile = fs.readFileSync('src/components/layout/MobileHeader.tsx', 'utf-8');
codeMobile = codeMobile.replace("import { useAuth } from '../../contexts/AuthContext';", "import { useAuth } from '../../contexts/AuthContext';\nimport { ThemeToggle } from '../ThemeToggle';");
codeMobile = codeMobile.replace(
  '{user && (',
  '<div className="flex items-center gap-2">\n        <ThemeToggle />\n        {user && ('
);
codeMobile = codeMobile.replace(
  '</span>\n      )}',
  '</span>\n      )}\n      </div>'
);
fs.writeFileSync('src/components/layout/MobileHeader.tsx', codeMobile);

console.log('Headers patched');
