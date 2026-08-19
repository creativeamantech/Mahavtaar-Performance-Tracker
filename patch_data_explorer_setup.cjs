const fs = require('fs');

// 1. Update Permissions
let permsCode = fs.readFileSync('src/constants/permissions.ts', 'utf-8');
if (!permsCode.includes("DATA_EXPLORER")) {
  permsCode = permsCode.replace(
    "export const VIEWS = {",
    "export const VIEWS = {\n  DATA_EXPLORER: 'data_explorer',"
  );
  permsCode = permsCode.replace(
    "MANAGER: [",
    "MANAGER: [VIEWS.DATA_EXPLORER, "
  );
  permsCode = permsCode.replace(
    "EXECUTIVE: [",
    "EXECUTIVE: [VIEWS.DATA_EXPLORER, "
  );
  permsCode = permsCode.replace(
    "VIEWER: [",
    "VIEWER: [VIEWS.DATA_EXPLORER, "
  );
  fs.writeFileSync('src/constants/permissions.ts', permsCode);
  console.log('Permissions updated');
}

// 2. Update App.tsx
let appCode = fs.readFileSync('src/App.tsx', 'utf-8');
if (!appCode.includes("DataExplorer")) {
  appCode = appCode.replace(
    "import CityTeamMatrix from \"./pages/CityTeamMatrix\";",
    "import CityTeamMatrix from \"./pages/CityTeamMatrix\";\nimport DataExplorer from \"./pages/DataExplorer\";"
  );
  appCode = appCode.replace(
    "<Route path=\"/city-pivot\"",
    "<Route path=\"/explorer\" element={<ProtectedRoute view={VIEWS.DATA_EXPLORER}><DataExplorer /></ProtectedRoute>} />\n      <Route path=\"/city-pivot\""
  );
  fs.writeFileSync('src/App.tsx', appCode);
  console.log('App routes updated');
}

// 3. Update Sidebar
let sidebarCode = fs.readFileSync('src/components/layout/AppSidebar.tsx', 'utf-8');
if (!sidebarCode.includes("Data Explorer")) {
  sidebarCode = sidebarCode.replace(
    "{ label: 'Data Entry', icon: FileText, path: '/data-entry', view: VIEWS.DATA_ENTRY },",
    "{ label: 'Data Entry', icon: FileText, path: '/data-entry', view: VIEWS.DATA_ENTRY },\n      { label: 'Data Explorer', icon: FileText, path: '/explorer', view: VIEWS.DATA_EXPLORER },"
  );
  // Optional: import Database icon instead of FileText
  sidebarCode = sidebarCode.replace("FileText, Building2", "FileText, Database, Building2");
  sidebarCode = sidebarCode.replace("icon: FileText, path: '/explorer'", "icon: Database, path: '/explorer'");
  if(!sidebarCode.includes("Database")) {
    sidebarCode = sidebarCode.replace("FileText", "FileText, Database");
  }
  fs.writeFileSync('src/components/layout/AppSidebar.tsx', sidebarCode);
  console.log('Sidebar updated');
}
