// render.js <html-file> <out-png> <width> <height> [scale] [alpha]
const { chromium } = require('playwright-core');
const path = require('path');

(async () => {
  const [, , htmlFile, outPng, w, h, scale, alpha] = process.argv;
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    headless: true,
    args: ['--no-sandbox', '--force-color-profile=srgb'],
  });
  const page = await browser.newPage({
    viewport: { width: parseInt(w), height: parseInt(h) },
    deviceScaleFactor: scale ? parseFloat(scale) : 1,
  });
  await page.goto('file://' + path.resolve(htmlFile), { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  await page.screenshot({ path: outPng, omitBackground: alpha === 'alpha' });
  await browser.close();
  console.log('rendered', outPng);
})().catch(e => { console.error('ERR:', e.message); process.exit(1); });
