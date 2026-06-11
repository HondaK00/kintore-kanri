import { chromium } from 'playwright';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage();

// セキュリティ警告を全て記録
const logs = [];
page.on('console', (m) => {
  logs.push({ type: m.type(), text: m.text() });
});

try {
  await page.goto('http://localhost:4173/');
  await page.waitForSelector('text=今日の記録', { timeout: 5000 });
  
  // Service Worker登録状況を確認
  const swStatus = await page.evaluate(() => {
    if (!navigator.serviceWorker) return 'no-sw-api';
    if (!navigator.serviceWorker.controller) return 'no-controller';
    return navigator.serviceWorker.controller.scriptURL;
  });
  
  console.log('SW Status:', swStatus);
  console.log('Errors/Warnings:', logs.filter(l => l.type === 'error' || l.type === 'warning'));
} catch (e) {
  console.error('Error:', e.message);
  console.log('Logs:', logs);
} finally {
  await browser.close();
}
