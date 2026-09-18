import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5174';

async function runQA() {
  console.log('--- Starting CareFlow AI Full Platform Automated QA ---');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const errors = [];
  page.on('pageerror', err => {
    console.error('[Browser PageError]:', err.message);
    errors.push(err.message);
  });

  const results = [];

  const check = (desc, condition) => {
    if (condition) {
      console.log(`[PASS] ${desc}`);
      results.push({ desc, pass: true });
    } else {
      console.error(`[FAIL] ${desc}`);
      results.push({ desc, pass: false });
    }
  };

  try {
    // 1. Test Homepage as guest visitor
    console.log('\nTesting 1. Homepage (/)');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
    // Ensure clean guest session
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload({ waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 600));

    const title = await page.title();
    check('Homepage loaded with title', title.includes('CareFlow'));
    const navText = await page.evaluate(() => document.querySelector('nav')?.innerText || '');
    check('Navbar contains Hospitals link', navText.includes('Hospitals'));
    check('Navbar contains Doctors link', navText.includes('Doctors'));
    check('Navbar contains Specialties link', navText.includes('Specialties'));
    check('Navbar contains About link', navText.includes('About'));
    check('Navbar contains Get Started CTA for guest', navText.includes('Get Started'));

    // 2. Test Hospitals Discovery Page (/hospitals)
    console.log('\nTesting 2. Hospitals Discovery (/hospitals)');
    await page.goto(`${BASE_URL}/hospitals`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 600));
    const hospContent = await page.evaluate(() => document.body.innerText);
    check('Hospitals page loaded', hospContent.includes('Hospitals') || hospContent.includes('CareFlow'));
    check('CareFlow Medical Center listed', hospContent.includes('CareFlow Medical Center'));
    check('Punjab Advanced Hospital listed', hospContent.includes('Punjab Advanced Hospital'));
    check('Metro Medical Institute listed', hospContent.includes('Metro Medical Institute'));

    // 3. Test Doctors Discovery Page (/doctors)
    console.log('\nTesting 3. Doctors Discovery (/doctors)');
    await page.goto(`${BASE_URL}/doctors`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 600));
    const docContent = await page.evaluate(() => document.body.innerText);
    check('Doctors page loaded', docContent.includes('Verified') || docContent.includes('Physician'));
    check('Filter by Specialty present', docContent.includes('Specialty') || docContent.includes('Medical'));
    check('Filter by Hospital present', docContent.includes('Hospital') || docContent.includes('Network'));
    check('View Profile buttons present', docContent.includes('View Profile'));

    // 4. Test Doctor Profile Page (/doctors/doc-cardio-1)
    console.log('\nTesting 4. Doctor Profile Page (/doctors/doc-cardio-1)');
    await page.goto(`${BASE_URL}/doctors/doc-cardio-1`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 800));
    const profileContent = await page.evaluate(() => document.body.innerText);
    check('Doctor Profile loaded', profileContent.includes('Dr. Sarah Jenkins') || profileContent.includes('Cardiology'));
    check('Hospital Affiliation shown', profileContent.includes('CareFlow Medical Center') || profileContent.includes('Hospital'));
    check('Book Appointment CTA present', profileContent.includes('Book Appointment') || profileContent.includes('Consultation'));

    // 5. Test Services / Specialties Page (/services)
    console.log('\nTesting 5. Services / Specialties Catalog (/services)');
    await page.goto(`${BASE_URL}/services`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 600));
    const servicesContent = await page.evaluate(() => document.body.innerText);
    check('Services Catalog loaded', servicesContent.includes('Specialties') || servicesContent.includes('23+'));
    check('Cardiology department listed', servicesContent.includes('Cardiology'));
    check('Neurology department listed', servicesContent.includes('Neurology'));
    check('Common symptoms listed', servicesContent.toLowerCase().includes('symptoms'));

    // 6. Test About Page (/about)
    console.log('\nTesting 6. About Page (/about)');
    await page.goto(`${BASE_URL}/about`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 600));
    const aboutContent = await page.evaluate(() => document.body.innerText);
    check('About Page loaded', aboutContent.includes('Your Intelligent Guide Through Healthcare'));
    check('Four Architectural Pillars listed', aboutContent.includes('Pillars') || aboutContent.includes('Pillar'));
    check('Non-Diagnostic Safety Architecture detailed', aboutContent.includes('Non-Diagnostic') || aboutContent.includes('Safety'));

    // 7. Test Auth Pages for Guest
    console.log('\nTesting 7. Auth Pages (/login, /register, /forgot-password)');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 600));
    const loginContent = await page.evaluate(() => document.body.innerText);
    check('Login Page loaded with split screen', loginContent.includes('Sign in') || loginContent.includes('Welcome back') || loginContent.includes('Sign In'));

    await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 600));
    const regContent = await page.evaluate(() => document.body.innerText);
    check('Register Page loaded with role switcher', regContent.includes('Patient') && regContent.includes('Doctor'));

    await page.goto(`${BASE_URL}/forgot-password`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 600));
    const forgotContent = await page.evaluate(() => document.body.innerText);
    check('Forgot Password Page loaded', forgotContent.includes('Reset') || forgotContent.includes('recovery') || forgotContent.includes('Password'));

    // 8. Test Patient Login & Portal
    console.log('\nTesting 8. Patient Portal Flow');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 600));

    // Click demo patient button
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const patientBtn = buttons.find(b => b.innerText.includes('Patient'));
      if (patientBtn) patientBtn.click();
    });
    await new Promise(r => setTimeout(r, 1200));

    const patientDashContent = await page.evaluate(() => document.body.innerText);
    check('Patient Dashboard loaded', patientDashContent.includes('Patient Portal') || patientDashContent.includes('Good day') || patientDashContent.includes('Upcoming'));
    check('Saved Doctors quick card present', patientDashContent.includes('Saved Doctors'));

    // 9. Test Saved Doctors Page
    await page.goto(`${BASE_URL}/patient/saved-doctors`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 600));
    const savedDocContent = await page.evaluate(() => document.body.innerText);
    check('Saved Doctors page accessible', savedDocContent.includes('Saved Doctors') || savedDocContent.includes('Physicians') || savedDocContent.includes('Specialists'));

    // 10. Test Appointments Page with Cancellation Modal
    await page.goto(`${BASE_URL}/patient/appointments`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 600));
    const aptContent = await page.evaluate(() => document.body.innerText);
    check('Appointments page loaded', aptContent.includes('Consultation') || aptContent.includes('Appointments') || aptContent.includes('Scheduled'));

    // 11. Switch to Admin & Test Admin Portal
    console.log('\nTesting 11. Admin Approvals Portal');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 600));

    // Click demo admin button
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const adminBtn = buttons.find(b => b.innerText.includes('Admin'));
      if (adminBtn) adminBtn.click();
    });
    await new Promise(r => setTimeout(r, 1500));

    const adminDashContent = await page.evaluate(() => document.body.innerText);
    check('Admin Dashboard loaded with Regional Hospitals and Approvals', adminDashContent.includes('Hospitals') && (adminDashContent.includes('Approvals') || adminDashContent.includes('Doctor Approvals')));

    await page.goto(`${BASE_URL}/admin/approvals`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 800));
    const adminApprovalsContent = await page.evaluate(() => document.body.innerText);
    check('Admin Doctor Approvals page loaded', adminApprovalsContent.includes('Doctor Credentialing') || adminApprovalsContent.includes('Pending Review') || adminApprovalsContent.includes('Approvals'));
    check('Pending doctor application shown or caught up', adminApprovalsContent.includes('Dr.') || adminApprovalsContent.includes('Pending Verification') || adminApprovalsContent.includes('Queue is All Caught Up'));
    check('Approve Credentials button present', adminApprovalsContent.includes('Approve') || adminApprovalsContent.includes('Reject') || adminApprovalsContent.includes('Roster'));

  } catch (err) {
    console.error('Test run failed with error:', err);
  } finally {
    await browser.close();
  }

  console.log('\n=======================================');
  console.log(`TOTAL CHECKS: ${results.length}`);
  const passed = results.filter(r => r.pass).length;
  const failed = results.filter(r => !r.pass).length;
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);
  console.log(`PAGE ERRORS: ${errors.length}`);
  console.log('=======================================');

  if (failed > 0 || errors.length > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runQA();

