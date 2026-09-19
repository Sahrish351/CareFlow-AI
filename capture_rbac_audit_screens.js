import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const BROWSER_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE_URL = 'http://localhost:5173';
const ARTIFACT_DIR = 'C:\\Users\\Universal Computer\\.gemini\\antigravity\\brain\\51759e12-b31b-40d9-9ab0-140a194d230a';
const AUDIT_DIR = path.join(ARTIFACT_DIR, 'visual_audit');

if (!fs.existsSync(AUDIT_DIR)) {
  fs.mkdirSync(AUDIT_DIR, { recursive: true });
}

async function captureScreens() {
  const browser = await puppeteer.launch({
    executablePath: BROWSER_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    // 1. Logged-out redirect to /login with flash alert
    const page1 = await browser.newPage();
    await page1.setViewport({ width: 1280, height: 800 });
    await page1.goto(`${BASE_URL}/dashboard`, { waitUntil: 'domcontentloaded' });
    await page1.waitForFunction(() => window.location.pathname.includes('/login'), { timeout: 3500 }).catch(() => {});
    await new Promise(r => setTimeout(r, 600));
    await page1.screenshot({ path: path.join(AUDIT_DIR, '13_login_redirect_guard.png') });
    await page1.close();

    // 2. 403 Unauthorized Access Page
    const page2 = await browser.newPage();
    await page2.setViewport({ width: 1280, height: 800 });
    await page2.goto(`${BASE_URL}/unauthorized`, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 600));
    await page2.screenshot({ path: path.join(AUDIT_DIR, '14_unauthorized_403_page.png') });
    await page2.close();

    // 3. Receptionist Dashboard
    const page3 = await browser.newPage();
    await page3.setViewport({ width: 1280, height: 800 });
    await page3.evaluateOnNewDocument(() => {
      sessionStorage.setItem('careflow_session_user', JSON.stringify({
        id: 'rec-001',
        role: 'receptionist',
        hospital_id: 'a0000001-0000-0000-0000-000000000001',
        full_name: 'Zainab Bibi',
        email: 'receptionist.zainab@careflow.ai'
      }));
    });
    await page3.goto(`${BASE_URL}/receptionist/dashboard`, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 800));
    await page3.screenshot({ path: path.join(AUDIT_DIR, '15_receptionist_dashboard.png') });
    await page3.close();

    // 4. Hospital Admin Dashboard
    const page4 = await browser.newPage();
    await page4.setViewport({ width: 1280, height: 800 });
    await page4.evaluateOnNewDocument(() => {
      sessionStorage.setItem('careflow_session_user', JSON.stringify({
        id: 'hosp-admin-001',
        role: 'hospital_admin',
        hospital_id: 'a0000001-0000-0000-0000-000000000001',
        full_name: 'Dr. Kamran Qureshi',
        email: 'admin.shifa@careflow.ai'
      }));
    });
    await page4.goto(`${BASE_URL}/hospital-admin/dashboard`, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 800));
    await page4.screenshot({ path: path.join(AUDIT_DIR, '16_hospital_admin_dashboard.png') });
    await page4.close();

    console.log('Screenshots captured successfully!');
  } finally {
    await browser.close();
  }
}

captureScreens().catch(console.error);
