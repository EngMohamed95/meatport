const fs = require('fs');
const path = require('path');

console.log("Replacing structural borders with shadows in AdminDashboard.tsx...");
const adminPath = path.join(__dirname, '../src/components/AdminDashboard.tsx');
let adminContent = fs.readFileSync(adminPath, 'utf8');

// Normalize to LF
adminContent = adminContent.replace(/\r\n/g, '\n');

// 1. Replace sidebar container border lines with shadow
adminContent = adminContent.replace(
  'className="w-72 h-screen shrink-0 bg-white dark:bg-gray-900 border-l border-r border-gray-150 dark:border-gray-800 flex flex-col justify-between p-6 shadow-xs select-none"',
  'className="w-72 h-screen shrink-0 bg-white dark:bg-gray-900 flex flex-col justify-between p-6 shadow-2xl z-10 select-none"'
);

// 2. Replace sidebar brand bottom border with spacing
adminContent = adminContent.replace(
  'className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-800"',
  'className="flex items-center gap-3 pb-4 mb-2"'
);

// 3. Replace sidebar footer top border
adminContent = adminContent.replace(
  'className="pt-4 border-t border-gray-150 dark:border-gray-800 space-y-3"',
  'className="pt-4 space-y-3"'
);

// 4. Replace top header bottom border with drop shadow
adminContent = adminContent.replace(
  'className="h-16 shrink-0 bg-white dark:bg-gray-900 border-b border-gray-150 dark:border-gray-800 px-8 flex items-center justify-between shadow-xs"',
  'className="h-16 shrink-0 bg-white dark:bg-gray-900 px-8 flex items-center justify-between shadow-md z-10"'
);

// 5. Replace card borders (metrics, search, settings containers) with soft shadows
adminContent = adminContent.replace(
  /border border-gray-100 dark:border-gray-800 shadow-sm/g,
  'shadow-[0_8px_30px_rgba(0,0,0,0.035)]'
);
adminContent = adminContent.replace(
  /border border-gray-100 shadow-sm/g,
  'shadow-[0_8px_30px_rgba(0,0,0,0.035)]'
);

// 6. Replace main tables/deck containers border lines with soft shadows
adminContent = adminContent.replace(
  /border border-gray-100 dark:border-gray-850 rounded-2xl overflow-hidden shadow-xs/g,
  'rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.04)]'
);
adminContent = adminContent.replace(
  /border border-gray-100 rounded-2xl overflow-hidden shadow-xs/g,
  'rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.04)]'
);
adminContent = adminContent.replace(
  /border border-gray-100 dark:border-gray-800 rounded-2xl/g,
  'rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.035)]'
);
adminContent = adminContent.replace(
  /border border-gray-100 rounded-2xl/g,
  'rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.035)]'
);

// 7. General settings & logs container borders
adminContent = adminContent.replace(
  /border border-gray-150 dark:border-gray-800 rounded-3xl/g,
  'rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.035)]'
);
adminContent = adminContent.replace(
  /border border-gray-100 rounded-3xl/g,
  'rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.035)]'
);

fs.writeFileSync(adminPath, adminContent, 'utf8');
console.log("Borders successfully refactored to shadows!");
