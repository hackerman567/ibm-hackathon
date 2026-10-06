const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/settings');

  // get theme before
  const themeBefore = await page.evaluate(() => document.documentElement.className);
  console.log('HTML classes before click:', themeBefore);
  
  // click the button
  await page.waitForSelector('button:has-text("Light Mode")');
  await page.click('button:has-text("Light Mode")');
  
  // get theme after
  await page.waitForTimeout(1000);
  const themeAfter = await page.evaluate(() => document.documentElement.className);
  console.log('HTML classes after click:', themeAfter);

  const btnText = await page.evaluate(() => {
    return document.querySelector('button:has-text("Dark Mode")') ? 'Dark Mode found' : 'Still Light Mode';
  });
  console.log('Button text after click:', btnText);

  await browser.close();
})();
