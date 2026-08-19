const fs = require('fs');
let code = fs.readFileSync('src/components/layout/AppSidebar.tsx', 'utf-8');

// Replace the aside classes to match the design (white background, w-64, etc.)
code = code.replace(
  /<aside className=\{\`fixed left-0 top-0 z-40 flex h-screen flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 ease-out \$\{collapsed \? 'w-\\[72px\\]' : 'w-\\[260px\\]'\} shadow-xl md:shadow-none\`\}\>/,
  '<aside className={`fixed left-0 top-0 z-40 flex h-screen flex-col bg-card border-r border-border text-foreground transition-all duration-300 ease-out ${collapsed ? "w-[72px]" : "w-64"}`}>\n      {/* Logo */}'
);

// We need to fix the logo area
code = code.replace(
  /<div className="flex h-16 shrink-0 items-center gap-3 px-4"\>/,
  '<div className="px-6 py-8 mb-2 flex items-center gap-3">'
);

// Logo icon
code = code.replace(
  /<div className="relative flex h-8 w-8 shrink-0 items-center justify-center text-accent"\>[\s\S]*?<\/div\>/,
  ''
);

// MAHAVTAAR text -> Mahavtaar CRM
code = code.replace(
  /\{!collapsed && \(\s*<span className="truncate font-sans text-sm font-bold tracking-widest text-sidebar-foreground"\>\s*MAHAVTAAR\s*<\/span>\s*\)\}/,
  `{!collapsed ? (
          <div>
            <h1 className="font-sans text-xl font-black text-primary">Mahavtaar CRM</h1>
            <p className="font-sans text-xs text-muted-foreground mt-1">Enterprise Recovery</p>
          </div>
        ) : (
          <div className="flex w-full justify-center">
            <h1 className="font-sans text-xl font-black text-primary">M</h1>
          </div>
        )}`
);

// Nav background classes
// Instead of text-sidebar-foreground/70 hover:bg-sidebar-accent, use new classes
code = code.replace(
  /className=\{\`mb-1 flex items-center gap-3 rounded-md px-3 py-2\.5 text-sm font-medium transition-all duration-200 \$\{\s*active\s*\?\s*'bg-accent text-accent-foreground shadow-sm'\s*:\s*'text-sidebar-foreground\/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'\s*\}\`\}/g,
  "className={`mb-1 flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-transform duration-200 ${active ? 'bg-accent text-accent-foreground font-semibold hover:translate-x-1' : 'text-muted-foreground hover:bg-muted hover:text-foreground hover:translate-x-1'}`}"
);

// Update icon classes
code = code.replace(
  /<item\.icon className=\{\`h-4 w-4 shrink-0 \$\{active \? 'text-accent-foreground' : 'text-sidebar-foreground\/50'\}\`\} \/>/g,
  "<item.icon className={`h-5 w-5 shrink-0 ${active ? 'text-accent-foreground' : 'text-muted-foreground'}`} />"
);

// Update groups title
code = code.replace(
  /<div className="mb-2 px-3 text-xs font-semibold text-sidebar-foreground\/50 uppercase tracking-wider"\>/g,
  '<div className="hidden">' // Hide group titles to match design
);

// User area
code = code.replace(
  /border-t border-white\/10 p-4 bg-sidebar/g,
  'mt-auto px-4 py-4 border-t border-border flex flex-col gap-2 bg-card'
);

code = code.replace(
  /bg-sidebar-accent\/50 p-2 border border-white\/5/g,
  'bg-muted/50 p-2 border border-border'
);

code = code.replace(
  /text-sidebar-foreground/g,
  'text-foreground'
);

fs.writeFileSync('src/components/layout/AppSidebar.tsx', code);
console.log("Fixed AppSidebar");
