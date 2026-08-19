const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

if (!code.includes('ThemeProvider')) {
  code = `import { ThemeProvider } from "./contexts/ThemeContext";\n` + code;
  code = code.replace('<AuthProvider>', '<ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">\n  <AuthProvider>');
  code = code.replace('</AuthProvider>', '</AuthProvider>\n  </ThemeProvider>');
  fs.writeFileSync('src/App.tsx', code);
  console.log('Added ThemeProvider');
}
