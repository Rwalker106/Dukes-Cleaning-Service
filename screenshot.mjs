import puppeteer from 'puppeteer';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const filePath = 'file:///' + resolve(__dirname, 'index.html').replace(/\\/g, '/');

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
await page.goto(filePath, { waitUntil: 'networkidle0', timeout: 15000 });

// Force all fade-in elements visible (bypass scroll-triggered animations)
await page.addStyleTag({ content: '.fade-in { opacity: 1 !important; transform: none !important; }' });
// Trigger scrolled navbar style for cleaner look
await page.evaluate(() => document.getElementById('navbar')?.classList.add('scrolled'));
await new Promise(r => setTimeout(r, 800)); // let fonts/images render

await page.screenshot({
  path: 'assets/site_preview.webp',
  type: 'webp',
  quality: 90,
  fullPage: true,
});

await browser.close();
console.log('Saved → assets/site_preview.webp');
