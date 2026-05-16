const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const s3 = '<div class="nav-item" onclick="switchTab(\'dashboardTab\', this)"';
const e3 = '<i class="fas fa-chart-pie"></i> <span class="nav-text">Dashboard</span>\n    </div>';
if (code.includes(s3) && code.includes(e3)) {
  code = code.slice(0, code.indexOf(s3)) + code.slice(code.indexOf(e3) + e3.length);
}

const s1 = '<!-- DASHBOARD V4 CSS -->';
const e1 = '<!-- END DASHBOARD V4 CSS -->';
if (code.includes(s1) && code.includes(e1)) {
  code = code.slice(0, code.indexOf(s1)) + code.slice(code.indexOf(e1) + e1.length);
}

const s2 = '<!-- TAB: DASHBOARD -->';
const e2 = '<!-- TAB: NPL & APPROVAL -->';
if (code.includes(s2) && code.includes(e2)) {
  code = code.slice(0, code.indexOf(s2)) + code.slice(code.indexOf(e2));
}

const sFunc = 'function loadDashboardData() {';
const eFunc = 'function formatPODisplay(o) {';
if (code.includes(sFunc) && code.includes(eFunc)) {
  code = code.slice(0, code.indexOf(sFunc)) + code.slice(code.indexOf(eFunc));
}

code = code.replace(/if \(tabId === "dashboardTab"\) \{ loadDashboardData\(\); \}/g, '');
code = code.replace(/if \(typeof renderDashboardCharts === 'function'\) \{\s*renderDashboardCharts\(currentMonth, currentYear\);\s*\}/g, '');

fs.writeFileSync('index.html', code);
console.log('Successfully removed ONLY dashboard.');
