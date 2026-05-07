import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import fs from 'fs';

const BASE_URL = 'https://sa.mktgdime.com';
const TEST_EMAIL = 'hello@mktgdime.com';
const TEST_PASS = 'Demo@4321';
const OUT_DIR = 'docs/screenshots';

const screens = [
  { name: '01-login',                 url: '/login',                 desc: 'Login Page',                     section: 'Authentication' },
  { name: '02-dashboard',             url: '/dashboard',             desc: 'Main Dashboard',                 section: 'Dashboard' },
  { name: '03-kanban',                url: '/kanban',                desc: 'Kanban Pipeline View',           section: 'Dashboard' },
  { name: '04-active',                url: '/active',                desc: 'Active Projects',                section: 'Dashboard' },
  { name: '05-leads',                 url: '/leads',                 desc: 'Leads List',                     section: 'Leads & Enquiries' },
  { name: '06-prospects',             url: '/prospects',             desc: 'Prospects',                      section: 'Leads & Enquiries' },
  { name: '07-enquiries',             url: '/enquiries',             desc: 'Enquiries List',                 section: 'Leads & Enquiries' },
  { name: '08-survey-schedule',       url: '/survey/schedule',       desc: 'Survey Schedule',                section: 'Survey' },
  { name: '09-survey',                url: '/survey',                desc: 'Survey List',                    section: 'Survey' },
  { name: '10-installation',          url: '/installation',          desc: 'Installation Tracker',           section: 'Installation' },
  { name: '11-wcr',                   url: '/wcr',                   desc: 'WCR - Work Completion Report',   section: 'Installation' },
  { name: '12-payments',              url: '/payments',              desc: 'Payments Tracker',               section: 'Payments & Subsidy' },
  { name: '13-subsidy',               url: '/subsidy',               desc: 'Subsidy Status',                 section: 'Payments & Subsidy' },
  { name: '14-liaison',               url: '/liaison',               desc: 'Liaison / Government Follow-up', section: 'Payments & Subsidy' },
  { name: '15-registration',          url: '/registration',          desc: 'Registration List',              section: 'Payments & Subsidy' },
  { name: '16-quotation',             url: '/quotation',             desc: 'Quotations List',                section: 'Quotation & BOM' },
  { name: '17-quotation-create',      url: '/quotation/create',      desc: 'Create Quotation',               section: 'Quotation & BOM' },
  { name: '18-bom',                   url: '/bom',                   desc: 'BOM List',                       section: 'Quotation & BOM' },
  { name: '19-bom-create',            url: '/bom/create',            desc: 'Create BOM',                     section: 'Quotation & BOM' },
  { name: '20-reports',               url: '/reports',               desc: 'Reports & Analytics',            section: 'Reports' },
  { name: '21-admin-tracker',         url: '/admin/tracker',         desc: 'Admin Tracker',                  section: 'Admin' },
  { name: '22-admin-users',           url: '/admin/users',           desc: 'Admin User Management',          section: 'Admin' },
  { name: '23-settings',              url: '/settings',              desc: 'Settings - Sheet Config',        section: 'Settings' },
  { name: '24-settings-users',        url: '/settings/users',        desc: 'Settings - Users',               section: 'Settings' },
  { name: '25-settings-roles',        url: '/settings/roles',        desc: 'Settings - Roles',               section: 'Settings' },
  { name: '26-settings-telegram',     url: '/settings/telegram',     desc: 'Settings - Telegram Bot',        section: 'Settings' },
  { name: '27-settings-organization', url: '/settings/organization', desc: 'Settings - Organization',        section: 'Settings' },
];

async function run() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const executablePath = await chromium.executablePath();

  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: { width: 1280, height: 800, deviceScaleFactor: 1.5 },
    executablePath,
    headless: chromium.headless,
  });

  const page = await browser.newPage();

  // ── Login page screenshot ──
  console.log('📸 Capturing login page...');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
  await page.screenshot({ path: `${OUT_DIR}/01-login.png`, fullPage: true });
  console.log('  ✅ 01-login.png');

  // ── Sign in ──
  console.log('\n🔐 Signing in...');
  try {
    await page.waitForSelector('button', { timeout: 5000 });
    // Click User tab if visible
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text?.trim() === 'User') { await btn.click(); break; }
    }
    await page.waitForTimeout(500);
    await page.type('input[type="email"]', TEST_EMAIL);
    await page.type('input[placeholder="Password"]', TEST_PASS);
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 20000 });
    console.log('  ✅ Signed in — URL:', page.url());
  } catch (e) {
    console.log('  ⚠️  Sign in issue:', e.message);
    console.log('  Current URL:', page.url());
  }

  // ── Capture all screens ──
  console.log('\n📸 Capturing all screens...');
  const results = [];

  for (const screen of screens.slice(1)) {
    try {
      await page.goto(`${BASE_URL}${screen.url}`, { waitUntil: 'networkidle2', timeout: 15000 });
      await page.waitForTimeout(1500);
      await page.screenshot({ path: `${OUT_DIR}/${screen.name}.png`, fullPage: true });
      console.log(`  ✅ ${screen.name}.png — ${screen.desc}`);
      results.push({ ...screen, status: 'ok' });
    } catch (err) {
      console.log(`  ❌ ${screen.name} — ${err.message}`);
      results.push({ ...screen, status: 'error', error: err.message });
    }
  }

  await browser.close();

  const ok = results.filter(r => r.status === 'ok').length + 1;
  const fail = results.filter(r => r.status === 'error').length;
  console.log('\n' + '='.repeat(50));
  console.log(`✅ Success: ${ok}/${screens.length}  ❌ Failed: ${fail}`);
  if (fail > 0) results.filter(r => r.status === 'error').forEach(r => console.log(`   - ${r.name}: ${r.error}`));
  console.log(`\n📁 Saved to: ${OUT_DIR}/`);
  fs.writeFileSync(`${OUT_DIR}/metadata.json`, JSON.stringify(screens, null, 2));
  console.log('📄 metadata.json saved');
}

run().catch(err => { console.error('Fatal:', err); process.exit(1); });