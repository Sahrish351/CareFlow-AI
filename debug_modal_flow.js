import puppeteer from 'puppeteer-core';

const BROWSER_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE_URL = 'http://localhost:5173';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: BROWSER_PATH,
    headless: 'new',
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1000));
  
  // Type search
  await page.click('input[placeholder*="back pain"]');
  await page.type('input[placeholder*="back pain"]', 'I have back pain and need a doctor tomorrow afternoon.');
  await page.click('button[type="submit"]');
  
  await page.waitForFunction(() => document.body.textContent?.includes('We Understood Your Request'), { timeout: 8000 });
  console.log('AI search done');

  // Click View Available Slots
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const slotBtn = btns.find(b => b.textContent?.includes('View Available Slots'));
    if (slotBtn) slotBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // Step 2: Hospital Selection
  const step2Selected = await page.evaluate(() => {
    const card = document.querySelector('.fixed .space-y-3 h4')?.closest('.cursor-pointer');
    if (card) {
      card.click();
      return card.textContent?.trim();
    }
    return null;
  });
  console.log('Step 2 Selected Hospital:', step2Selected);
  await new Promise(r => setTimeout(r, 500));

  // Click Next
  await page.evaluate(() => {
    const nextBtn = Array.from(document.querySelectorAll('.fixed button')).find(b => b.textContent?.trim() === 'Next' && !b.disabled);
    if (nextBtn) nextBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // Step 3: Doctor Selection
  const step3Selected = await page.evaluate(() => {
    const card = document.querySelector('.fixed .space-y-3 h4')?.closest('.cursor-pointer');
    if (card) {
      card.click();
      return card.textContent?.trim();
    }
    return null;
  });
  console.log('Step 3 Selected Doctor:', step3Selected);
  await new Promise(r => setTimeout(r, 500));

  // Click Next
  await page.evaluate(() => {
    const nextBtn = Array.from(document.querySelectorAll('.fixed button')).find(b => b.textContent?.trim() === 'Next' && !b.disabled);
    if (nextBtn) nextBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // Step 4: Date (Already pre-selected)
  console.log('Step 4 (Date) - clicking Next');
  await page.evaluate(() => {
    const nextBtn = Array.from(document.querySelectorAll('.fixed button')).find(b => b.textContent?.trim() === 'Next' && !b.disabled);
    if (nextBtn) nextBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // Step 5: Slot Selection
  await page.waitForFunction(() => {
    const slotBtns = Array.from(document.querySelectorAll('.fixed button')).filter(b => b.textContent?.includes('Available'));
    return slotBtns.length > 0;
  }, { timeout: 4000 });
  const step5Selected = await page.evaluate(() => {
    const slotBtns = Array.from(document.querySelectorAll('.fixed button')).filter(b => b.textContent?.includes('Available'));
    if (slotBtns.length > 0) {
      slotBtns[0].click();
      return slotBtns[0].textContent?.trim();
    }
    return null;
  });
  console.log('Step 5 Selected Slot:', step5Selected);
  await new Promise(r => setTimeout(r, 500));

  // Click Next
  await page.evaluate(() => {
    const nextBtn = Array.from(document.querySelectorAll('.fixed button')).find(b => b.textContent?.trim() === 'Next' && !b.disabled);
    if (nextBtn) nextBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // Step 6: Patient Info
  console.log('Step 6 (Patient Info) - filling inputs');
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

  // Click Next
  await page.evaluate(() => {
    const nextBtn = Array.from(document.querySelectorAll('.fixed button')).find(b => b.textContent?.trim() === 'Next' && !b.disabled);
    if (nextBtn) nextBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // Step 7: Confirmation
  console.log('Step 7 (Confirmation) - clicking Confirm & Generate Ticket');
  await page.evaluate(() => {
    const confirmBtn = Array.from(document.querySelectorAll('.fixed button')).find(b => b.textContent?.includes('Confirm & Generate Ticket'));
    if (confirmBtn) confirmBtn.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  const result = await page.evaluate(() => {
    const text = document.body.textContent || '';
    return {
      hasConfirmed: text.includes('Your Appointment is Confirmed!'),
      hasQueueToken: text.includes('Live Queue Ticket'),
      hasVisitPlan: text.includes('Before-You-Leave Visit Plan'),
      buttonTexts: Array.from(document.querySelectorAll('.fixed button')).map(b => b.textContent?.trim())
    };
  });
  console.log('Final Result:', result);

  await browser.close();
}

run();

