import puppeteer from 'puppeteer-core';

const BROWSER_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE_URL = 'http://localhost:5173';

async function debugModal() {
  const browser = await puppeteer.launch({
    executablePath: BROWSER_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 850 });

  page.on('response', resp => {
    if (resp.status() >= 400) {
      console.log(`HTTP ${resp.status()}: ${resp.url()}`);
    }
  });

  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 800));

  // Search
  await page.click('input[placeholder*="back pain" i]');
  await page.type('input[placeholder*="back pain" i]', 'I have back pain and need a doctor tomorrow afternoon.');
  await page.click('button[type="submit"]');

  await page.waitForFunction(() => {
    const text = document.body.textContent || '';
    return text.includes('We Understood Your Request');
  }, { timeout: 8000 });

  console.log('AI Search completed');

  // Click View Available Slots
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const slotBtn = btns.find(b => b.textContent?.includes('View Available Slots'));
    if (slotBtn) slotBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  for (let step = 2; step <= 7; step++) {
    const stepInfo = await page.evaluate(() => {
      const h3 = document.querySelector('.fixed h3, .fixed h4, .fixed label');
      const text = document.body.textContent || '';
      const btns = Array.from(document.querySelectorAll('.fixed button')).map(b => ({
        text: b.textContent?.trim(),
        disabled: b.disabled
      }));
      return {
        stepHeader: h3?.textContent?.trim(),
        buttons: btns,
        bodySnippet: text.slice(0, 300)
      };
    });
    console.log(`Step trace (iteration ${step}):`, JSON.stringify(stepInfo));

    // Try selecting items based on step
    if (step === 2) {
      // Select hospital
      await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('.space-y-3 > div'));
        if (cards.length > 0) cards[0].click();
      });
    } else if (step === 3) {
      // Select doctor
      await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('.space-y-3 > div'));
        if (cards.length > 0) cards[0].click();
      });
    } else if (step === 5) {
      // Select slot
      await page.evaluate(() => {
        const slotBtns = Array.from(document.querySelectorAll('button')).filter(b => b.textContent?.includes('Available'));
        if (slotBtns.length > 0) slotBtns[0].click();
      });
    }

    await new Promise(r => setTimeout(r, 500));

    // Click Next or Confirm
    const clickedNext = await page.evaluate((currStep) => {
      const btns = Array.from(document.querySelectorAll('.fixed button'));
      if (currStep === 7) {
        const confirmBtn = btns.find(b => b.textContent?.includes('Confirm'));
        if (confirmBtn) {
          confirmBtn.click();
          return 'Confirm';
        }
      } else {
        const nextBtn = btns.find(b => b.textContent?.trim() === 'Next' && !b.disabled);
        if (nextBtn) {
          nextBtn.click();
          return 'Next';
        }
      }
      return null;
    }, step);

    console.log(`Clicked button at step ${step}:`, clickedNext);
    await new Promise(r => setTimeout(r, 800));
  }

  await new Promise(r => setTimeout(r, 2000));
  const finalContent = await page.evaluate(() => document.body.textContent?.slice(0, 1000));
  console.log('Final Content:', finalContent);

  await browser.close();
}

debugModal();
