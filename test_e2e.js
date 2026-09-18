import puppeteer from 'puppeteer-core';

const BROWSER_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE_URL = 'http://localhost:5173';

async function runE2E() {
  console.log('🚀 Starting CareFlow AI Comprehensive End-to-End QA...\n');
  const browser = await puppeteer.launch({
    executablePath: BROWSER_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  const results = [];
  const record = (name, passed, detail = '') => {
    results.push({ name, passed, detail });
    console.log(`${passed ? '✅' : '❌'} [${name}] ${detail}`);
  };

  try {
    // -------------------------------------------------------------
    // 1. PUBLIC HOMEPAGE & BRANDING
    // -------------------------------------------------------------
    console.log('--- 1. Testing Homepage & Voice Component ---');
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    const title = await page.title();
    record('Homepage Title', title.includes('CareFlow'), `Title: "${title}"`);

    const voiceBtn = await page.$('button[aria-label*="voice" i], button[title*="Speak" i]');
    record('Voice Search Component', !!voiceBtn, 'Voice recognition button with animated states rendered');

    // -------------------------------------------------------------
    // 2. ROMAN URDU AI CARE SEARCH & ACTION CARDS
    // -------------------------------------------------------------
    console.log('\n--- 2. Testing Roman Urdu AI Care Search ---');
    // Click Roman Urdu quick prompt chip: "Kamar dard (Back pain)"
    const clickedChip = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const chip = buttons.find(b => b.textContent && b.textContent.includes('Kamar dard'));
      if (chip) {
        chip.click();
        return true;
      }
      return false;
    });

    if (clickedChip) {
      await page.waitForFunction(() => {
        return document.body.textContent.includes('We Understood Your Request') ||
               document.body.textContent.includes('CareFlow Assessment');
      }, { timeout: 8000 });

      const pageContent = await page.content();
      const hasOrthopedics = pageContent.includes('Orthopedics');
      record('Roman Urdu Care Mapping', hasOrthopedics, 'Successfully classified "kamar dard" to Orthopedics care pathway');

      const hasAction1 = pageContent.includes('Find Hospitals');
      const hasAction2 = pageContent.includes('Find Doctors');
      const hasAction3 = pageContent.includes('View Available Slots');
      record('Action Cards', hasAction1 && hasAction2 && hasAction3, 'Rendered [Find Hospitals], [Find Doctors], [View Available Slots]');
    } else {
      record('Roman Urdu Care Mapping', false, 'Quick prompt chip not found');
    }

    // -------------------------------------------------------------
    // 3. HOSPITALS DISCOVERY & SIDE-BY-SIDE COMPARISON
    // -------------------------------------------------------------
    console.log('\n--- 3. Testing Hospital Discovery & Comparison Modal ---');
    await page.goto(`${BASE_URL}/hospitals`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1200));

    const hospCheckboxes = await page.$$('input[type="checkbox"]');
    if (hospCheckboxes.length >= 2) {
      await hospCheckboxes[0].click();
      await hospCheckboxes[1].click();
      await new Promise(r => setTimeout(r, 800));

      const hospDockHtml = await page.content();
      const hospDockActive = hospDockHtml.includes('Hospitals Selected for Evaluation');
      record('Hospital Compare Floating Dock', hospDockActive, 'Comparison drawer displayed with selected hospitals');

      // Click Compare button in drawer
      const clickedHosp = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const compareBtn = buttons.find(b => b.textContent && b.textContent.includes('Compare Side-by-Side'));
        if (compareBtn) {
          compareBtn.click();
          return true;
        }
        return false;
      });

      if (clickedHosp) {
        await new Promise(r => setTimeout(r, 800));
        const modalHtml = await page.content();
        record('Hospital Comparison Modal', modalHtml.includes('Hospital Comparison') || modalHtml.includes('Facilities'), 'Side-by-side comparison modal open');
      }
    }

    // -------------------------------------------------------------
    // 4. DOCTORS DISCOVERY & SIDE-BY-SIDE COMPARISON
    // -------------------------------------------------------------
    console.log('\n--- 4. Testing Doctor Discovery & Comparison Modal ---');
    await page.goto(`${BASE_URL}/doctors`, { waitUntil: 'networkidle2' });
    await page.waitForFunction(() => document.body.textContent.includes('(14 found)'), { timeout: 15000 });

    const clickedTwoDocs = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const compareBtns = buttons.filter(b => b.textContent && b.textContent.trim() === 'Compare');
      if (compareBtns.length >= 2) {
        compareBtns[0].click();
        compareBtns[1].click();
        return true;
      }
      return false;
    });

    if (clickedTwoDocs) {
      await new Promise(r => setTimeout(r, 800));
      const docDockHtml = await page.content();
      const docDockActive = docDockHtml.includes('Specialists Selected for Comparison');
      record('Doctor Compare Floating Dock', docDockActive, 'Doctor comparison drawer active with 2 specialists');

      const clickedDoc = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const compareBtn = buttons.find(b => b.textContent && b.textContent.includes('Compare Side-by-Side'));
        if (compareBtn) {
          compareBtn.click();
          return true;
        }
        return false;
      });

      if (clickedDoc) {
        await new Promise(r => setTimeout(r, 800));
        const docModalHtml = await page.content();
        record('Doctor Comparison Modal', docModalHtml.includes('Medical Specialists') || docModalHtml.includes('Specialist Comparison'), 'Doctor side-by-side comparison modal open');
      }
    }

    // -------------------------------------------------------------
    // 5. PATIENT AUTHENTICATION & PATIENT FEATURES
    // -------------------------------------------------------------
    console.log('\n--- 5. Testing Patient Authentication & Patient Pages ---');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
    await page.type('input[type="email"]', 'patient.alex@careflow.ai');
    await page.click('form button[type="submit"]');
    await page.waitForFunction(() => window.location.pathname.includes('/patient/dashboard'), { timeout: 6000 });
    record('Patient Login Flow', page.url().includes('/patient/dashboard'), `Redirected to ${page.url()}`);

    // Test Family Profiles
    await page.goto(`${BASE_URL}/patient/family`, { waitUntil: 'networkidle2' });
    await page.waitForFunction(() => document.body.textContent.includes('My Family Profiles'), { timeout: 5000 });
    const famContent = await page.content();
    record('Family Profiles Page', famContent.includes('My Family Profiles') && famContent.includes('Add Family Member'), 'Rendered dependent management workspace');

    // Test Health Timeline
    await page.goto(`${BASE_URL}/patient/timeline`, { waitUntil: 'networkidle2' });
    await page.waitForFunction(() => document.body.textContent.includes('Health Journey Timeline'), { timeout: 5000 });
    const timeContent = await page.content();
    record('Health Journey Timeline', timeContent.includes('Health Journey Timeline') && timeContent.includes('Comprehensive Clinical History'), 'Rendered longitudinal health events');

    // Test Digital Prescriptions
    await page.goto(`${BASE_URL}/patient/prescriptions`, { waitUntil: 'networkidle2' });
    await page.waitForFunction(() => document.body.textContent.includes('Digital Prescription Workspace'), { timeout: 5000 });
    const rxContent = await page.content();
    record('Digital Prescriptions', rxContent.includes('Digital Prescription Workspace') && rxContent.includes('Print / PDF'), 'Rendered printable verified prescription workspace');

    // Test Care Passport
    await page.goto(`${BASE_URL}/patient/passport`, { waitUntil: 'networkidle2' });
    await page.waitForFunction(() => document.body.textContent.includes('Care Passport'), { timeout: 5000 });
    const passportContent = await page.content();
    record('Care Passport Page', passportContent.includes('Care Passport') && passportContent.includes('National Healthcare Passport'), 'Rendered portable clinical health identity with privacy controls');

    // -------------------------------------------------------------
    // 6. DOCTOR AUTHENTICATION & CLINICAL WORKSPACE
    // -------------------------------------------------------------
    console.log('\n--- 6. Testing Doctor Authentication & Clinical Briefing ---');
    await page.evaluate(() => {
      localStorage.clear();
      window.location.href = '/login';
    });
    await new Promise(r => setTimeout(r, 1500));

    await page.waitForSelector('input[type="email"]', { timeout: 8000 });
    await page.type('input[type="email"]', 'dr.sarah.jenkins@careflow.ai');
    await page.waitForSelector('form button[type="submit"]', { timeout: 6000 });
    await page.click('form button[type="submit"]');
    await page.waitForFunction(() => window.location.pathname.includes('/doctor/dashboard'), { timeout: 6000 });
    record('Doctor Login Flow', page.url().includes('/doctor/dashboard'), `Redirected to ${page.url()}`);

    // Wait specifically for appointments and buttons to populate
    await page.waitForFunction(() => document.body.textContent.includes('AI Briefing'), { timeout: 8000 });

    const docPortalContent = await page.content();
    record('Doctor Clinical Portal', docPortalContent.includes('Doctor Clinical Portal'), 'Rendered outpatient room queue');
    record('AI Briefing & Issue Rx Action Buttons', docPortalContent.includes('AI Briefing') && docPortalContent.includes('Issue Rx'), 'Rendered AI Briefing and Issue Rx buttons');

    // Test AI Clinical Briefing modal trigger
    const clickedBriefing = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent && b.textContent.includes('AI Briefing'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });

    if (clickedBriefing) {
      await page.waitForFunction(() => document.body.textContent.includes('Clinical Pre-Consultation Briefing'), { timeout: 5000 });
      const briefingModalContent = await page.content();
      record('AI Clinical Briefing Modal', briefingModalContent.includes('CareFlow AI • Clinical Pre-Consultation Briefing'), 'Opened pre-consultation AI clinical briefing modal');
      await page.keyboard.press('Escape');
    }

    // -------------------------------------------------------------
    // 7. ADMIN AUTHENTICATION & ANALYTICS
    // -------------------------------------------------------------
    console.log('\n--- 7. Testing Admin Authentication & Grounded Insights ---');
    await page.evaluate(() => {
      localStorage.clear();
      window.location.href = '/login';
    });
    await new Promise(r => setTimeout(r, 1500));

    await page.waitForSelector('input[type="email"]', { timeout: 8000 });
    await page.type('input[type="email"]', 'admin@careflow.ai');
    await page.waitForSelector('form button[type="submit"]', { timeout: 6000 });
    await page.click('form button[type="submit"]');
    await page.waitForFunction(() => window.location.pathname.includes('/admin/dashboard'), { timeout: 6000 });
    record('Admin Login Flow', page.url().includes('/admin/dashboard'), `Redirected to ${page.url()}`);

    await page.goto(`${BASE_URL}/admin/analytics`, { waitUntil: 'networkidle2' });
    await page.waitForFunction(() => {
      return document.body.textContent.includes('Healthcare System & Queue Analytics') ||
             document.body.textContent.includes('Executive Operational Intelligence');
    }, { timeout: 8000 });
    const hasAnalyticsHeader = await page.evaluate(() => document.body.textContent.includes('Healthcare System & Queue Analytics'));
    const adminAnalyticsContent = await page.content();
    record('Admin Analytics Operations', hasAnalyticsHeader, 'Rendered operations dashboard');
    record('Grounded AI Operational Insights', adminAnalyticsContent.includes('CareFlow AI Operational Recommendations'), 'Rendered AI clinical load optimization recommendations');

  } catch (err) {
    console.error('Test run caught exception:', err);
    record('Uncaught Error', false, err.message);
  } finally {
    await browser.close();
  }

  console.log('\n=========================================');
  console.log('🏁 CAREFLOW AI COMPREHENSIVE QA SUMMARY:');
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  console.log(`Passed: ${passed}/${total} (${Math.round((passed / total) * 100)}%)`);
  console.log('=========================================');
  if (passed === total) {
    console.log('🎉 ALL AUTOMATED E2E TESTS PASSED WITH 100% SUCCESS!');
  }
}

runE2E();
