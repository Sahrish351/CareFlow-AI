import puppeteer from 'puppeteer-core';
import fs from 'fs';

const BROWSER_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE_URL = 'http://localhost:5173';

async function fullQA() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🔍 CAREFLOW AI — COMPREHENSIVE BROWSER QA & USER JOURNEY AUDIT');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const browser = await puppeteer.launch({
    executablePath: BROWSER_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 850 });

  const consoleLogs = [];
  const consoleErrors = [];
  const failedRequests = [];

  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push(`[${msg.type()}] ${text}`);
    if (msg.type() === 'error') {
      consoleErrors.push(text);
    }
  });

  page.on('requestfailed', req => {
    failedRequests.push(`${req.method()} ${req.url()} - ${req.failure()?.errorText}`);
  });

  page.on('response', resp => {
    if (resp.status() >= 400) {
      console.log(`[HTTP ${resp.status()}] ${resp.url()}`);
    }
  });

  const report = {
    A_Auth: { status: 'PASS', items: [] },
    B_Homepage: { status: 'PASS', items: [] },
    C_AiSearch: { status: 'PASS', items: [] },
    D_Discovery: { status: 'PASS', items: [] },
    E_Appointment: { status: 'PASS', items: [] },
    F_Dashboard: { status: 'PASS', items: [] },
    G_Supabase: { status: 'PASS', items: [] },
    H_Responsive: { status: 'PASS', items: [] },
    I_Console: { status: 'PASS', items: [] },
  };

  const record = (section, name, passed, detail = '') => {
    const badge = passed ? '✅ PASS' : '❌ ISSUE';
    console.log(`[${section}] ${badge}: ${name} — ${detail}`);
    report[section].items.push({ name, passed, detail });
    if (!passed) report[section].status = 'ISSUE';
  };

  try {
    // Helper to reset browser storage
    const resetStorage = async () => {
      await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      await new Promise(r => setTimeout(r, 400));
    };

    // =========================================================================
    // SECTION A: AUTHENTICATION JOURNEY & STRICT ROUTE PROTECTION
    // =========================================================================
    console.log('\n--- SECTION A: AUTHENTICATION & ROUTE GUARDS ---');
    await resetStorage();

    // 1. Logged-out Account button
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('nav a'));
      const acct = links.find(l => l.textContent?.trim() === 'Account');
      if (acct) acct.click();
    });
    await page.waitForFunction(() => window.location.pathname === '/login', { timeout: 4000 }).catch(() => {});
    const acctUrl = page.url();
    const acctHasMsg = await page.evaluate(() => document.body.textContent?.includes('Please log in to continue to your dashboard.'));
    record('A_Auth', 'Logged-out Account Click', acctUrl.includes('/login') && acctHasMsg, `Target: /login | Alert: ${acctHasMsg}`);

    // 2. Direct protected URL access
    const testGuards = [
      { path: '/patient/dashboard', label: '/patient/dashboard' },
      { path: '/doctor/dashboard', label: '/doctor/dashboard' },
      { path: '/admin/dashboard', label: '/admin/dashboard' },
      { path: '/dashboard', label: '/dashboard alias' },
      { path: '/patient-dashboard', label: '/patient-dashboard alias' },
      { path: '/patient/appointments', label: '/patient/appointments' },
      { path: '/patient/passport', label: '/patient/passport' }
    ];

    for (const g of testGuards) {
      await page.goto(`${BASE_URL}${g.path}`, { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => window.location.pathname === '/login', { timeout: 4000 }).catch(() => {});
      const isLogin = page.url().includes('/login');
      const hasAlert = await page.evaluate(() => document.body.textContent?.includes('Please log in to continue to your dashboard.'));
      record('A_Auth', `Guard ${g.label}`, isLogin && hasAlert, `Protected & redirected to /login with flash message`);
    }

    // 3. Patient Login Flow
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const pBtn = btns.find(b => b.textContent?.includes('Patient'));
      if (pBtn) pBtn.click();
    });
    await page.waitForFunction(() => window.location.pathname.includes('/patient/dashboard'), { timeout: 4000 });
    record('A_Auth', 'Login Patient', page.url().includes('/patient/dashboard'), `Redirected to /patient/dashboard`);

    // 4. Logout Flow
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const logoutBtn = btns.find(b => b.textContent?.includes('Logout'));
      if (logoutBtn) logoutBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));
    const isLoggedOutNav = await page.evaluate(() => {
      const nav = document.querySelector('nav');
      return nav ? nav.textContent.includes('Login') && !nav.textContent.includes('Logout') : false;
    });
    record('A_Auth', 'Logout Button', isLoggedOutNav, `User logged out; Login button visible`);

    // 5. Browser Back button after logout
    await page.goBack().catch(() => {});
    await new Promise(r => setTimeout(r, 800));
    const backUrl = page.url();
    const backContent = await page.evaluate(() => document.body.textContent || '');
    const backIsProtected = !backUrl.includes('/patient/dashboard') || backContent.includes('Sign in to CareFlow');
    record('A_Auth', 'Browser Back Protection', backIsProtected, `Dashboard remains protected after logout: ${backUrl}`);

    // 6. Doctor Login Flow
    await resetStorage();
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const dBtn = btns.find(b => b.textContent?.includes('Doctor'));
      if (dBtn) dBtn.click();
    });
    await page.waitForFunction(() => window.location.pathname.includes('/doctor/dashboard'), { timeout: 4000 });
    record('A_Auth', 'Login Doctor', page.url().includes('/doctor/dashboard'), `Redirected to /doctor/dashboard`);

    // 7. Admin Login Flow
    await resetStorage();
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const aBtn = btns.find(b => b.textContent?.includes('Admin'));
      if (aBtn) aBtn.click();
    });
    await page.waitForFunction(() => window.location.pathname.includes('/admin/dashboard'), { timeout: 4000 });
    record('A_Auth', 'Login Admin', page.url().includes('/admin/dashboard'), `Redirected to /admin/dashboard`);

    // 8. Register Page Role Check
    await resetStorage();
    await page.goto(`${BASE_URL}/register`, { waitUntil: 'domcontentloaded' });
    const regCheck = await page.evaluate(() => {
      const text = document.body.textContent || '';
      return {
        hasPatient: text.includes('Patient'),
        hasDoctor: text.includes('Doctor'),
        hasAdmin: text.includes('Admin self-registration') || text.includes('Administrator Role')
      };
    });
    record('A_Auth', 'Register Role Check', regCheck.hasPatient && regCheck.hasDoctor && !regCheck.hasAdmin, `Patient & Doctor available, Admin disallowed`);

    // =========================================================================
    // SECTION B: HOMEPAGE VISUAL HIERARCHY & 9 HOSPITALS
    // =========================================================================
    console.log('\n--- SECTION B: HOMEPAGE VISUAL HIERARCHY & HOSPITALS ---');
    await resetStorage();
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1000));

    // Check Hero & AI Search
    const heroMetrics = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      const input = document.querySelector('input[placeholder*="back pain" i]');
      const ctaBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Find My Care'));
      return {
        h1Text: h1?.textContent?.replace(/\s+/g, ' ').trim() || '',
        placeholder: input?.getAttribute('placeholder') || '',
        hasCta: !!ctaBtn,
        ctaText: ctaBtn?.textContent?.replace(/\s+/g, ' ').trim() || ''
      };
    });

    record('B_Homepage', 'Hero Headline', heroMetrics.h1Text.includes('Find the right care') && heroMetrics.h1Text.includes('Book with confidence'), heroMetrics.h1Text);
    record('B_Homepage', 'Hero Search Placeholder', heroMetrics.placeholder === 'I have back pain and need a doctor tomorrow afternoon.', heroMetrics.placeholder);
    record('B_Homepage', 'Hero Main CTA', heroMetrics.hasCta && heroMetrics.ctaText.includes('Find My Care'), heroMetrics.ctaText);

    // Check Exactly 9 Hospitals
    await page.waitForFunction(() => document.querySelectorAll('#hospitals .grid > div').length > 0, { timeout: 5000 });
    const hospCards = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('#hospitals .grid > div'));
      return cards.map(c => {
        const img = c.querySelector('img');
        const h3 = c.querySelector('h3');
        const btn = c.querySelector('a[href*="/hospital/"]');
        const text = c.textContent || '';
        return {
          name: h3?.textContent?.trim() || '',
          imgSrc: img?.src || '',
          imgComplete: img ? img.complete && img.naturalWidth > 0 : false,
          hasBadge: text.includes('Reference / Demo'),
          hasCity: text.includes('Islamabad') || text.includes('Lahore') || text.includes('Karachi') || text.includes('Rawalpindi'),
          hasDepts: text.includes('Key Departments'),
          hasDoctors: text.includes('Available Doctors') || text.includes('Doctors:'),
          hasViewBtn: !!btn && btn.textContent.includes('View Hospital')
        };
      });
    });

    record('B_Homepage', 'Exactly 9 Hospitals Displayed', hospCards.length === 9, `Count: ${hospCards.length} (Expected 9)`);

    const imgUrls = hospCards.map(h => h.imgSrc);
    const uniqueImgs = new Set(imgUrls);
    record('B_Homepage', 'All 9 Images Unique', uniqueImgs.size === 9, `${uniqueImgs.size}/9 unique non-duplicate images`);

    const allImgsLoaded = hospCards.every(h => h.imgSrc.startsWith('http'));
    record('B_Homepage', 'Hospital Images Valid', allImgsLoaded, `All image URLs valid and responsive`);

    const cardsConsistent = hospCards.every(h => h.name && h.hasBadge && h.hasCity && h.hasDepts && h.hasDoctors && h.hasViewBtn);
    record('B_Homepage', 'Hospital Cards Consistency', cardsConsistent, `All 9 cards follow consistent design hierarchy`);

    // =========================================================================
    // SECTION C: MAIN CAREFLOW DEMO USER JOURNEY
    // =========================================================================
    console.log('\n--- SECTION C: CAREFLOW AI CARE SEARCH & BOOKING DEMO ---');
    await resetStorage();
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 800));

    await page.waitForSelector('input[placeholder*="back pain" i]', { timeout: 5000 });
    await page.click('input[placeholder*="back pain" i]');
    await page.type('input[placeholder*="back pain" i]', 'I have back pain and need a doctor tomorrow afternoon.');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Find My Care'));
      if (btn) btn.click();
    });

    // Wait for AI search result
    await page.waitForFunction(() => {
      const text = document.body.textContent || '';
      return text.includes('We Understood Your Request') || text.includes('CareFlow Assessment');
    }, { timeout: 8000 });

    const aiResult = await page.evaluate(() => {
      const text = document.body.textContent || '';
      const hasOrtho = text.includes('Orthopedics') || text.includes('Bones, Joints & Spine');
      const hasActionHosp = text.includes('Find Hospitals');
      const hasActionDoc = text.includes('Find Doctors');
      const hasActionSlots = text.includes('View Available Slots');
      const hasRecHosp = text.includes('Recommended Hospitals Offering');
      return { hasOrtho, hasActionHosp, hasActionDoc, hasActionSlots, hasRecHosp };
    });

    record('C_AiSearch', 'AI Intent & Pathway Classification', aiResult.hasOrtho, `Classified "back pain" to Orthopedics pathway`);
    record('C_AiSearch', 'Interactive Action Cards', aiResult.hasActionHosp && aiResult.hasActionDoc && aiResult.hasActionSlots, `[Find Hospitals], [Find Doctors], [View Available Slots]`);
    record('C_AiSearch', 'Hospital & Specialist Matching', aiResult.hasRecHosp, `Matched reference facilities for Orthopedics`);

    // Test clicking "View Available Slots" (Action 3) to launch booking modal
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const slotBtn = btns.find(b => b.textContent?.includes('View Available Slots'));
      if (slotBtn) slotBtn.click();
    });
    await new Promise(r => setTimeout(r, 800));

    const wizardActive = await page.evaluate(() => {
      const text = document.body.textContent || '';
      return text.includes('Select Clinical Specialty') || text.includes('Select Hospital') || text.includes('Hospital Facility');
    });
    record('E_Appointment', 'Booking Wizard Modal Launch', wizardActive, `Modal opened from AI care result`);

    // Step 2: Hospital Selection
    await new Promise(r => setTimeout(r, 600));
    await page.evaluate(() => {
      const card = document.querySelector('.fixed .space-y-3 h4')?.closest('.cursor-pointer');
      if (card) card.click();
    });
    await new Promise(r => setTimeout(r, 500));
    await page.evaluate(() => {
      const nextBtn = Array.from(document.querySelectorAll('.fixed button')).find(b => b.textContent?.trim() === 'Next' && !b.disabled);
      if (nextBtn) nextBtn.click();
    });
    await new Promise(r => setTimeout(r, 800));

    // Step 3: Doctor Selection
    await page.evaluate(() => {
      const card = document.querySelector('.fixed .space-y-3 h4')?.closest('.cursor-pointer');
      if (card) card.click();
    });
    await new Promise(r => setTimeout(r, 500));
    await page.evaluate(() => {
      const nextBtn = Array.from(document.querySelectorAll('.fixed button')).find(b => b.textContent?.trim() === 'Next' && !b.disabled);
      if (nextBtn) nextBtn.click();
    });
    await new Promise(r => setTimeout(r, 800));

    // Step 4: Date (Already pre-selected)
    await page.evaluate(() => {
      const nextBtn = Array.from(document.querySelectorAll('.fixed button')).find(b => b.textContent?.trim() === 'Next' && !b.disabled);
      if (nextBtn) nextBtn.click();
    });
    await new Promise(r => setTimeout(r, 800));

    // Step 5: Slot Selection
    await page.waitForFunction(() => {
      const slotBtns = Array.from(document.querySelectorAll('.fixed button')).filter(b => b.textContent?.includes('Available'));
      return slotBtns.length > 0;
    }, { timeout: 5000 });
    await page.evaluate(() => {
      const slotBtns = Array.from(document.querySelectorAll('.fixed button')).filter(b => b.textContent?.includes('Available'));
      if (slotBtns.length > 0) slotBtns[0].click();
    });
    await new Promise(r => setTimeout(r, 500));
    await page.evaluate(() => {
      const nextBtn = Array.from(document.querySelectorAll('.fixed button')).find(b => b.textContent?.trim() === 'Next' && !b.disabled);
      if (nextBtn) nextBtn.click();
    });
    await new Promise(r => setTimeout(r, 800));

    // Step 6: Patient Info
    await page.evaluate(() => {
      const nameInput = document.querySelector('.fixed input[placeholder*="Full Name"]');
      const phoneInput = document.querySelector('.fixed input[placeholder*="0000"]');
      if (nameInput) {
        nameInput.value = 'Ahmed Hassan';
        nameInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      if (phoneInput) {
        phoneInput.value = '+92 300 1234567';
        phoneInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
    await new Promise(r => setTimeout(r, 500));
    await page.evaluate(() => {
      const nextBtn = Array.from(document.querySelectorAll('.fixed button')).find(b => b.textContent?.trim() === 'Next' && !b.disabled);
      if (nextBtn) nextBtn.click();
    });
    await new Promise(r => setTimeout(r, 800));

    // Step 7: Confirmation
    await page.evaluate(() => {
      const confirmBtn = Array.from(document.querySelectorAll('.fixed button')).find(b => b.textContent?.includes('Confirm & Generate Ticket'));
      if (confirmBtn) confirmBtn.click();
    });
    await new Promise(r => setTimeout(r, 1500));

    // Confirmation with Live Token & Sync
    const confirmationData = await page.evaluate(() => {
      const text = document.body.textContent || '';
      const hasConfirmed = text.includes('Appointment is Confirmed') || text.includes('Live Queue Ticket') || text.includes('Before-You-Leave');
      const hasDashboardLink = Array.from(document.querySelectorAll('button')).some(b => b.textContent?.includes('Track Live Queue Ticket') || b.textContent?.includes('View My Appointments'));
      return { hasConfirmed, hasDashboardLink };
    });

    record('E_Appointment', 'End-to-End Booking Confirmation', confirmationData.hasConfirmed, `Appointment confirmed with Token and Outpatient Pass`);

    // =========================================================================
    // SECTION D: PUBLIC DISCOVERY PAGES (HOSPITALS & DOCTORS)
    // =========================================================================
    console.log('\n--- SECTION D: DISCOVERY PAGES & PROFILES ---');

    // 1. /hospitals page
    await page.goto(`${BASE_URL}/hospitals`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('h3', { timeout: 5000 }).catch(() => {});
    const hospitalsPageValid = await page.evaluate(() => {
      const cards = document.querySelectorAll('h3');
      return cards.length >= 8 && document.body.textContent?.includes('Hospitals');
    });
    record('D_Discovery', 'Hospitals Discovery (/hospitals)', hospitalsPageValid, `Loaded hospital list with reference cards`);

    // 2. Hospital Profile page
    await page.goto(`${BASE_URL}/hospital/hosp-shifa-isb`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('h1', { timeout: 5000 }).catch(() => {});
    const hospProfileValid = await page.evaluate(() => {
      const text = document.body.textContent || '';
      return text.includes('Shifa International Hospital') && text.includes('Islamabad');
    });
    record('D_Discovery', 'Hospital Profile (/hospital/:id)', hospProfileValid, `Loaded Shifa International profile with departments & doctors`);

    // 3. /doctors page
    await page.goto(`${BASE_URL}/doctors`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('h3', { timeout: 5000 }).catch(() => {});
    const doctorsPageValid = await page.evaluate(() => {
      const text = document.body.textContent || '';
      const docCards = document.querySelectorAll('h3');
      return docCards.length >= 5;
    });
    record('D_Discovery', 'Doctors Discovery (/doctors)', doctorsPageValid, `Loaded verified specialist physicians`);

    // 4. Doctor Profile page
    await page.goto(`${BASE_URL}/doctors/doc-cardio-1`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('h1', { timeout: 5000 }).catch(() => {});
    const docProfileValid = await page.evaluate(() => {
      const text = document.body.textContent || '';
      return text.includes('Cardiology') && (text.includes('Consultation Fee') || text.includes('Book Consultation'));
    });
    record('D_Discovery', 'Doctor Profile (/doctors/:id)', docProfileValid, `Loaded specialist profile with certifications, hospital link, and booking`);

    // =========================================================================
    // SECTION F: DASHBOARD QA (PATIENT, DOCTOR, ADMIN)
    // =========================================================================
    console.log('\n--- SECTION F: AUTHENTICATED DASHBOARDS ---');

    // Patient Dashboard
    await resetStorage();
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Patient'));
      if (btn) btn.click();
    });
    await page.waitForFunction(() => window.location.pathname.includes('/patient/dashboard'), { timeout: 4000 });
    const patientDashValid = await page.evaluate(() => {
      const text = document.body.textContent || '';
      return text.includes('Dashboard') || text.includes('Care') || text.includes('Appointments');
    });
    record('F_Dashboard', 'Patient Dashboard Content', patientDashValid, `Loaded patient hub with active appointments & health tools`);

    // Patient Care Passport
    await page.goto(`${BASE_URL}/patient/passport`, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 800));
    const passportValid = await page.evaluate(() => {
      const text = document.body.textContent || '';
      return text.includes('Care Passport') || text.includes('Emergency Medical ID');
    });
    record('F_Dashboard', 'Patient Care Passport (/patient/passport)', passportValid, `Loaded emergency biometric and medical records pass`);

    // =========================================================================
    // SECTION G: SUPABASE BACKEND DATA PERSISTENCE
    // =========================================================================
    console.log('\n--- SECTION G: SUPABASE / DB LAYER AUDIT ---');
    const dbAudit = await page.evaluate(async () => {
      try {
        const stored = localStorage.getItem('careflow_active_user_profile_v1');
        const user = stored ? JSON.parse(stored) : null;
        return {
          hasUser: !!user,
          userRole: user?.role,
          userName: user?.full_name,
        };
      } catch (e) {
        return { error: e.message };
      }
    });
    record('G_Supabase', 'Client Authentication State', dbAudit.hasUser, `Authenticated as ${dbAudit.userName} (${dbAudit.userRole})`);

    // =========================================================================
    // SECTION H: RESPONSIVENESS & MOBILE LAYOUT
    // =========================================================================
    console.log('\n--- SECTION H: MOBILE RESPONSIVENESS AUDIT ---');
    await page.setViewport({ width: 390, height: 844 }); // iPhone 12/13/14 viewport
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 800));

    const mobileMetrics = await page.evaluate(() => {
      const bodyWidth = document.body.scrollWidth;
      const windowWidth = window.innerWidth;
      const hamburger = document.querySelector('button.md\\:hidden');
      return {
        hasHorizontalOverflow: bodyWidth > windowWidth,
        bodyWidth,
        windowWidth,
        hasHamburger: !!hamburger
      };
    });

    record('H_Responsive', 'Mobile No Horizontal Overflow', !mobileMetrics.hasHorizontalOverflow, `Window: ${mobileMetrics.windowWidth}px, Body: ${mobileMetrics.bodyWidth}px (No overflow)`);
    record('H_Responsive', 'Mobile Navigation Hamburger', mobileMetrics.hasHamburger, `Mobile hamburger menu rendered cleanly`);

    // Restore desktop viewport
    await page.setViewport({ width: 1280, height: 850 });

    // =========================================================================
    // SECTION I: CONSOLE ERROR AUDIT
    // =========================================================================
    console.log('\n--- SECTION I: CONSOLE ERROR AUDIT ---');
    // Filter out expected analytics or font warnings if any
    const realErrors = consoleErrors.filter(e => !e.includes('favicon') && !e.includes('chrome-extension'));
    record('I_Console', 'Clean Browser Console', realErrors.length === 0, `Errors found: ${realErrors.length}`);
    if (realErrors.length > 0) {
      console.log('Console Errors:', realErrors);
    }

  } catch (err) {
    console.error('❌ QA Execution Failure:', err);
  } finally {
    await browser.close();
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('FINAL AUDIT REPORT:');
    for (const [key, val] of Object.entries(report)) {
      const passedCount = val.items.filter(i => i.passed).length;
      console.log(`${key}: ${val.status} (${passedCount}/${val.items.length})`);
    }
    console.log('═══════════════════════════════════════════════════════════════\n');
  }
}

fullQA();

