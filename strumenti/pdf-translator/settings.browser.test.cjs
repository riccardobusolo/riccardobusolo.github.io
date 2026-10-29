/* Optional browser regression: NODE_PATH must include Playwright. No real API calls. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
let chromium;
try { ({ chromium } = require('playwright')); } catch (_) {}
const repo = path.resolve(__dirname, '../..');
const chrome = process.env.DOCUSHIFT_BROWSER || (process.platform === 'win32' ? 'C:/Program Files/Google/Chrome/Application/chrome.exe' : null);

test('original compact settings accept OpenAI keys, preserve drafts and recover after cancellation', { skip: !chromium || (chrome && !fs.existsSync(chrome)) }, async () => {
  const server = http.createServer((req, res) => {
    const pathname = decodeURIComponent(req.url.split('?')[0]);
    const file = path.resolve(repo, '.' + (pathname.endsWith('/') ? pathname + 'index.html' : pathname));
    if (!file.startsWith(repo + path.sep) || /(?:^|[\\/])\.|\.local\.js$/.test(file.slice(repo.length))) { res.writeHead(403); res.end(); return; }
    try {
      const body = fs.readFileSync(file);
      res.setHeader('Content-Type', ({ '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.svg': 'image/svg+xml' })[path.extname(file)] || 'application/octet-stream');
      res.end(body);
    } catch (_) { res.writeHead(404); res.end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await chromium.launch({ ...(chrome ? { executablePath: chrome } : {}), headless: true });
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const errors = [], scripts = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('request', req => { if (req.resourceType() === 'script') scripts.push(req.url()); });
    await page.route('https://fonts.googleapis.com/**', route => route.abort());
    let requests = 0, mode = 'success';
    await page.route('https://api.openai.com/**', async route => {
      requests++;
      if (mode === 'pending') { await new Promise(resolve => setTimeout(resolve, 1200)); }
      if (mode === 'error') {
        await route.fulfill({ status: 401, json: { error: { message: 'Chiave non valida' } } }).catch(() => {});
      } else {
        await route.fulfill({ json: { status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: '{"ok":true}' }] }] } }).catch(() => {});
      }
    });
    const url = `http://127.0.0.1:${server.address().port}/strumenti/pdf-translator/`;
    await page.goto(url);
    await page.waitForSelector('#api-setup-popup.active');
    assert.equal(await page.locator('#popup-model').isVisible(), false);
    assert.equal(await page.locator('#popup-remember').isVisible(), false);
    assert.ok((await page.locator('.popup-card').boundingBox()).height < 500);
    assert.ok(scripts.filter(s => /app\.js|ai-service\.js|pdf-engine\.js|glossary\.js/.test(s)).every(s => s.endsWith('?v=4.0.1')));
    assert.equal(await page.locator('.hero__desc').innerText(), 'Preserva layout, immagini e grafica.');

    await page.fill('#popup-api-key', 'sk-popup-draft');
    await page.click('#btn-close-popup');
    await page.click('#btn-open-settings');
    assert.equal(await page.locator('#input-api-key').inputValue(), 'sk-popup-draft');
    assert.equal(await page.locator('.modal-overlay.active').count(), 1);
    await page.fill('#input-api-key', 'sk-settings-draft');
    await page.selectOption('#settings-provider', 'gemini');
    await page.fill('#input-api-key', 'AIza-gemini-draft');
    await page.selectOption('#settings-provider', 'openai');
    assert.equal(await page.locator('#input-api-key').inputValue(), 'sk-settings-draft');
    assert.equal(await page.locator('#settings-model').isVisible(), false);

    mode = 'error';
    await page.click('#btn-test-gemini');
    await page.waitForFunction(() => !document.getElementById('input-api-key').disabled);
    assert.equal(await page.locator('#input-api-key').inputValue(), 'sk-settings-draft');
    mode = 'pending';
    await page.click('#btn-test-gemini');
    await page.waitForFunction(() => document.getElementById('btn-test-gemini').textContent === 'Annulla');
    await page.click('#btn-test-gemini');
    await page.waitForFunction(() => !document.getElementById('input-api-key').disabled);
    await page.fill('#input-api-key', 'sk-after-cancel');
    mode = 'success';
    await page.click('#btn-test-gemini');
    await page.waitForFunction(() => !document.getElementById('file-input').disabled);
    assert.equal(await page.locator('.modal-overlay.active').count(), 0);

    // A saved old key must not trigger a request or disable settings at startup.
    await page.evaluate(() => { localStorage.setItem('docushift_provider', 'openai'); localStorage.setItem('docushift_openai_key', 'sk-saved-old'); sessionStorage.removeItem('docushift_openai_key'); });
    const before = requests;
    await page.reload();
    await page.click('#btn-open-settings');
    assert.equal(await page.locator('#input-api-key').isEnabled(), true);
    assert.equal(requests, before);
    await page.fill('#input-api-key', 'sk-mobile-entry');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForFunction(() => {
      const field = document.getElementById('input-api-key').getBoundingClientRect();
      return field.width > 150 && field.right <= innerWidth;
    });
    const field = await page.locator('#input-api-key').boundingBox();
    if (process.env.DOCUSHIFT_QA_OUTPUT) await page.screenshot({path:path.join(process.env.DOCUSHIFT_QA_OUTPUT,'settings-mobile-fixed.png')});
    assert.ok(field.width > 150 && field.x >= 0 && field.x + field.width <= 390, JSON.stringify(field));
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
    if (process.env.DOCUSHIFT_QA_OUTPUT) {
      await page.screenshot({ path: path.join(process.env.DOCUSHIFT_QA_OUTPUT, 'settings-mobile-fixed.png') });
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.screenshot({ path: path.join(process.env.DOCUSHIFT_QA_OUTPUT, 'settings-desktop-fixed.png') });
    }
    assert.deepEqual(errors, []);
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
});
