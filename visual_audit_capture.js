import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const BROWSER_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE_URL = 'http://localhost:5173';
const SHOTS_DIR = 'C:\\Users\\Universal Computer\\.gemini\\antigravity\\brain\\51759e12-b31b-40d9-9ab0-140a194d230a\\visual_audit';

if (!fs.existsSync(SHOTS_DIR)) {
  fs.mkdirSync(SHOTS_DIR, { recursive: true });
}

async function captureAudit() {
  const browser = await puppeteer.launch({
    executablePath: BROWSER_PATH,
    headless: 'new',
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log('1. Capturing Homepage Hero...');
  await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(SHOTS_DIR, '01_homepage_hero.png') });

  console.log('2. Capturing Homepage Hospitals...');
  const hospEl = await page.$('#hospitals');
  if (hospEl) {
    await hospEl.scrollIntoView();
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(SHOTS_DIR, '02_homepage_hospitals.png') });
  }

  console.log('3. Capturing Hospitals Discovery...');
  await page.goto(`${BASE_URL}/hospitals`, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(SHOTS_DIR, '03_hospitals_discovery.png') });

  console.log('4. Capturing Hospital Detail (Shifa)...');
  await page.goto(`${BASE_URL}/hospital/hosp-shifa-isb`, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(SHOTS_DIR, '04_hospital_shifa.png') });

  console.log('5. Capturing Doctors Discovery...');
  await page.goto(`${BASE_URL}/doctors`, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(SHOTS_DIR, '05_doctors_discovery.png') });

  console.log('6. Capturing Doctor Detail (Cardiology)...');
  await page.goto(`${BASE_URL}/doctors/doc-cardio-1`, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(SHOTS_DIR, '06_doctor_cardio.png') });

  console.log('7. Capturing Login Page...');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(SHOTS_DIR, '07_login_page.png') });

  console.log('8. Capturing Register Page...');
  await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(SHOTS_DIR, '08_register_page.png') });

  // Log in as patient
  console.log('9. Logging in as Patient and Capturing Dashboard...');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const pBtn = btns.find(b => b.textContent?.includes('Patient'));
    if (pBtn) pBtn.click();
  });
  await page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => {});
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(SHOTS_DIR, '09_patient_dashboard.png') });

  console.log('10. Capturing Patient Queue...');
  await page.goto(`${BASE_URL}/patient/queue`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(SHOTS_DIR, '10_patient_queue.png') });

  console.log('11. Capturing Care Passport...');
  await page.goto(`${BASE_URL}/patient/passport`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(SHOTS_DIR, '11_care_passport.png') });

  console.log('12. Capturing Appointment Wizard Modal...');
  await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const bookBtn = btns.find(b => b.textContent?.includes('Book Appointment'));
    if (bookBtn) bookBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(SHOTS_DIR, '12_booking_wizard.png') });

  console.log('Visual audit captures completed in:', SHOTS_DIR);
  await browser.close();
}

captureAudit();

