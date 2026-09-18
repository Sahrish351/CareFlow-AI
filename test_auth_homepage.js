import puppeteer from 'puppeteer-core';

const BROWSER_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE_URL = 'http://localhost:5173';

async function runTest() {
  console.log('🚀 Starting CareFlow AI Authentication, Homepage & Hospital Verification...\n');
  const browser = await puppeteer.launch({
    executablePath: BROWSER_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  const results = [];
  const record = (testName, passed, detail = '') => {
    results.push({ testName, passed, detail });
    console.log(`${passed ? '✅' : '❌'} [${testName}] ${detail}`);
  };

  try {
    // Helper to clear session/localStorage
    const clearStorage = async () => {
      await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
    };

    // =========================================================================
    // 1. STRICT AUTHENTICATION GUARD ON DASHBOARDS (UNAUTHENTICATED)
    // =========================================================================
    console.log('--- 1. Testing Strict Authentication Guard on Dashboards ---');
    await clearStorage();

    const protectedUrls = [
      { url: `${BASE_URL}/patient-dashboard`, name: '/patient-dashboard alias' },
      { url: `${BASE_URL}/doctor-dashboard`, name: '/doctor-dashboard alias' },
      { url: `${BASE_URL}/admin-dashboard`, name: '/admin-dashboard alias' },
      { url: `${BASE_URL}/dashboard`, name: '/dashboard shortcut' },
      { url: `${BASE_URL}/account`, name: '/account shortcut' },
      { url: `${BASE_URL}/patient/dashboard`, name: '/patient/dashboard' },
      { url: `${BASE_URL}/patient/appointments`, name: '/patient/appointments' },
      { url: `${BASE_URL}/patient/queue`, name: '/patient/queue' },
      { url: `${BASE_URL}/patient/passport`, name: '/patient/passport' },
    ];

    for (const item of protectedUrls) {
      await page.goto(item.url, { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => window.location.pathname.includes('/login'), { timeout: 4000 }).catch(() => {});
      const currentUrl = page.url();
      const isLogin = currentUrl.includes('/login');
      const text = await page.evaluate(() => document.body.textContent || '');
      const hasMessage = text.includes('Please log in to continue to your dashboard.');
      record(
        `Guard: ${item.name}`,
        isLogin && hasMessage,
        `Redirected to: ${currentUrl.replace(BASE_URL, '')} | Flash message displayed: ${hasMessage}`
      );
    }

    // =========================================================================
    // 2. NAVBAR AUTHENTICATION UI & ACCOUNT LINK
    // =========================================================================
    console.log('\n--- 2. Testing Navbar Authentication UI ---');
    await clearStorage();
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

    // Check presence of navbar links
    const navText = await page.evaluate(() => {
      const nav = document.querySelector('nav');
      return nav ? nav.textContent : '';
    });

    const hasHome = navText.includes('Home');
    const hasFindCare = navText.includes('Find Care');
    const hasHospitals = navText.includes('Hospitals');
    const hasDoctors = navText.includes('Doctors');
    const hasHowItWorks = navText.includes('How It Works');
    const hasAbout = navText.includes('About');
    const hasAccount = navText.includes('Account');
    const hasLogin = navText.includes('Login');
    const hasGetStarted = navText.includes('Get Started');
    const hasDashboardBtn = navText.includes('Dashboard');

    record('Navbar Required Links', hasHome && hasFindCare && hasHospitals && hasDoctors && hasHowItWorks && hasAbout && hasAccount, 'Found Home, Find Care, Hospitals, Doctors, How It Works, About, Account');
    record('Navbar Auth CTAs (Logged Out)', hasLogin && hasGetStarted && !hasDashboardBtn, `Login: ${hasLogin}, Get Started: ${hasGetStarted}, Dashboard hidden: ${!hasDashboardBtn}`);

    // Click Account link as logged out user
    await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('nav a'));
      const accountLink = links.find(l => l.textContent && l.textContent.trim() === 'Account');
      if (accountLink) accountLink.click();
    });
    await page.waitForNavigation({ waitUntil: 'domcontentloaded' }).catch(() => {});
    const accountRedirectUrl = page.url();
    const accountPageText = await page.evaluate(() => document.body.textContent || '');
    const accountRedirectedToLogin = accountRedirectUrl.includes('/login') && accountPageText.includes('Please log in to continue to your dashboard.');
    record('Navbar Account Button (Logged Out)', accountRedirectedToLogin, `Clicking Account opens /login with message: ${accountRedirectedToLogin}`);

    // =========================================================================
    // 3. HOMEPAGE HERO SECTION
    // =========================================================================
    console.log('\n--- 3. Testing Homepage Hero Section Copy & CTA ---');
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 800));

    const heroContent = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      const input = document.querySelector('input[placeholder*="back pain" i]');
      const ctaBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Find My Care'));
      return {
        h1Text: h1 ? h1.textContent : '',
        inputPlaceholder: input ? input.getAttribute('placeholder') : '',
        ctaText: ctaBtn ? ctaBtn.textContent : ''
      };
    });

    const headlineMatch = heroContent.h1Text.includes('Find the right care') && heroContent.h1Text.includes('Book with confidence');
    record('Hero Headline', headlineMatch, `Headline: "${heroContent.h1Text.replace(/\s+/g, ' ').trim()}"`);

    const placeholderMatch = heroContent.inputPlaceholder === 'I have back pain and need a doctor tomorrow afternoon.';
    record('Hero Search Placeholder', placeholderMatch, `Placeholder: "${heroContent.inputPlaceholder}"`);

    const ctaMatch = heroContent.ctaText.includes('Find My Care');
    record('Hero Main CTA Button', ctaMatch, `CTA Button text: "${heroContent.ctaText.replace(/\s+/g, ' ').trim()}"`);

    // =========================================================================
    // 4. EXACTLY 9 HOSPITALS ON HOMEPAGE
    // =========================================================================
    console.log('\n--- 4. Testing Exactly 9 Hospitals on Homepage ---');
    await page.waitForFunction(() => document.querySelectorAll('#hospitals a[href*="/hospital/"]').length > 0, { timeout: 5000 }).catch(() => {});
    const hospitalData = await page.evaluate(() => {
      const section = document.getElementById('hospitals');
      if (!section) return { count: 0, cards: [] };

      // Cards inside the grid
      const grid = section.querySelector('.grid');
      if (!grid) return { count: 0, cards: [] };

      const cardElements = Array.from(grid.children);
      const cards = cardElements.map(el => {
        const img = el.querySelector('img');
        const h3 = el.querySelector('h3');
        const text = el.textContent || '';
        const viewBtn = el.querySelector('a[href*="/hospital/"]');
        return {
          name: h3 ? h3.textContent.trim() : '',
          imageSrc: img ? img.src : '',
          hasBadge: text.includes('Reference / Demo'),
          hasCity: text.includes('Islamabad') || text.includes('Lahore') || text.includes('Karachi') || text.includes('Rawalpindi'),
          hasDoctors: text.includes('Available Doctors') || text.includes('Doctors:'),
          hasDepartments: text.includes('Key Departments'),
          hasViewButton: !!viewBtn && viewBtn.textContent.includes('View Hospital')
        };
      });

      return { count: cardElements.length, cards };
    });

    record('Hospital Cards Count', hospitalData.count === 9, `Rendered exactly ${hospitalData.count} hospitals (Expected: 9)`);

    // Check unique images across all 9
    const imageSrcs = hospitalData.cards.map(c => c.imageSrc);
    const uniqueImages = new Set(imageSrcs);
    record('Hospital Unique Images', uniqueImages.size === 9, `Unique high-res image URLs: ${uniqueImages.size}/9 (No duplicates)`);

    // Verify card structure
    const allCardsValid = hospitalData.cards.every(c => c.name && c.imageSrc && c.hasBadge && c.hasCity && c.hasDoctors && c.hasDepartments && c.hasViewButton);
    record('Hospital Card UI Elements', allCardsValid, 'All 9 cards contain: Image, Name, City, "Reference / Demo" badge, Key departments, Available doctors, "View Hospital" button');

    console.log('List of 9 Hospitals Verified:');
    hospitalData.cards.forEach((c, idx) => {
      console.log(`   ${idx + 1}. ${c.name}`);
    });

    // =========================================================================
    // 5. AUTHENTICATION FLOW & ROLE DETECTION
    // =========================================================================
    console.log('\n--- 5. Testing Authentication Flows & Role-Based Routing ---');
    await clearStorage();

    // Patient Demo Login
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const patientBtn = buttons.find(b => b.textContent && b.textContent.includes('Patient'));
      if (patientBtn) patientBtn.click();
    });
    await new Promise(r => setTimeout(r, 1200));
    const patientUrl = page.url();
    record('Patient Login Flow', patientUrl.includes('/patient/dashboard'), `Redirected to: ${patientUrl.replace(BASE_URL, '')}`);

    // Verify Account button when logged in as patient
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    const loggedInNav = await page.evaluate(() => document.querySelector('nav')?.textContent || '');
    record('Navbar When Logged In', loggedInNav.includes('Dashboard') && loggedInNav.includes('Logout'), 'Shows Dashboard and Logout options');

    // Click Account when logged in as patient
    await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('nav a'));
      const accountLink = links.find(l => l.textContent && l.textContent.trim() === 'Account');
      if (accountLink) accountLink.click();
    });
    await new Promise(r => setTimeout(r, 1000));
    record('Account Link When Logged In (Patient)', page.url().includes('/patient/dashboard'), `Account navigated to patient dashboard: ${page.url().replace(BASE_URL, '')}`);

    // Doctor Demo Login
    await clearStorage();
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const doctorBtn = buttons.find(b => b.textContent && b.textContent.includes('Doctor'));
      if (doctorBtn) doctorBtn.click();
    });
    await new Promise(r => setTimeout(r, 1200));
    const doctorUrl = page.url();
    record('Doctor Login Flow', doctorUrl.includes('/doctor/dashboard'), `Redirected to: ${doctorUrl.replace(BASE_URL, '')}`);

    // Admin Demo Login
    await clearStorage();
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const adminBtn = buttons.find(b => b.textContent && b.textContent.includes('Admin'));
      if (adminBtn) adminBtn.click();
    });
    await new Promise(r => setTimeout(r, 1200));
    const adminUrl = page.url();
    record('Admin Login Flow', adminUrl.includes('/admin/dashboard'), `Redirected to: ${adminUrl.replace(BASE_URL, '')}`);

    // =========================================================================
    // 6. REGISTER PAGE RESTRICTIONS
    // =========================================================================
    console.log('\n--- 6. Testing Register Page Role Restrictions ---');
    await clearStorage();
    await page.goto(`${BASE_URL}/register`, { waitUntil: 'domcontentloaded' });
    const regText = await page.evaluate(() => document.body.textContent || '');
    const hasPatientOption = regText.includes('Patient') || regText.includes('Personal Care');
    const hasDoctorOption = regText.includes('Doctor') || regText.includes('Medical Specialist');
    const hasAdminOption = regText.includes('Admin Account') || regText.includes('Administrator Role');

    record('Register Page Roles', hasPatientOption && hasDoctorOption && !hasAdminOption, `Patient: ${hasPatientOption}, Doctor: ${hasDoctorOption}, Admin disbarred: ${!hasAdminOption}`);

  } catch (err) {
    console.error('❌ Test execution error:', err);
    record('Test Suite Completion', false, err.message);
  } finally {
    await browser.close();
    console.log('\n======================================================');
    const passedCount = results.filter(r => r.passed).length;
    console.log(`SUMMARY: ${passedCount}/${results.length} PASSED (${Math.round((passedCount / results.length) * 100)}%)`);
    console.log('======================================================\n');
  }
}

runTest();

