// 実ブラウザでの動作確認スクリプト（要: npm run preview を起動しておく）
// 使い方: node scripts/smoke.mjs
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = process.env.BASE_URL ?? 'http://localhost:4173';
const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', '.screenshots');
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });

const errors = [];
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(`[console] ${m.text()}`);
});
page.on('pageerror', (e) => errors.push(`[pageerror] ${e.message}`));

const shot = (name) => page.screenshot({ path: join(outDir, name) });
const tab = (label) => page.locator('nav button', { hasText: label }).click();

try {
  await page.goto(BASE);
  await page.waitForSelector('text=今日の記録', { timeout: 15000 });
  await shot('01-home-initial.png');

  // --- 設定: プロフィール入力 ---
  const settingsBack = page.locator('div.fixed.z-40 header button');
  await page.locator('header button').first().click();
  await page.locator('text=プロフィール・目標').click();
  await page.locator('input[placeholder="170"]').fill('175');
  await page.locator('input[placeholder="65"]').fill('70');
  await page.locator('input[placeholder="30"]').fill('30');
  await page.keyboard.press('Tab');
  await page.locator('label:has-text("目標摂取") input').fill('2200');
  await page.locator('label:has-text("P目標") input').fill('140');
  await page.locator('label:has-text("F目標") input').fill('55');
  await page.locator('label:has-text("C目標") input').fill('230');
  await page.keyboard.press('Tab');
  await page.locator('button:has-text("保存する")').click();
  await page.waitForSelector('text=保存しました');
  await shot('02-settings-profile.png');
  // 設定を閉じる（メニューへ戻る → 閉じる）
  await settingsBack.click();
  await settingsBack.click();
  await page.waitForSelector('text=今日のカロリー収支');

  // --- 筋トレ: ルーティン開始 + セット入力 ---
  await tab('筋トレ');
  await page.locator('button:has-text("胸の日")').click();
  await page.waitForSelector('text=ベンチプレス');
  const bench = page.locator('div.rounded-2xl').filter({ hasText: 'ベンチプレス' }).first();
  await bench.locator('button:has-text("セット追加")').click();
  await bench.locator('input').nth(0).fill('60');
  await page.keyboard.press('Enter');
  await bench.locator('input').nth(1).fill('10');
  await page.keyboard.press('Enter');
  await bench.locator('button:has-text("セット追加")').click();
  await bench.locator('button:has-text("セット追加")').click();
  // セット2を異なる重量にし、セット1を削除しても残りが正しく保持されるか検証（key安定性の回帰テスト）
  await bench.locator('input').nth(2).fill('65');
  await page.keyboard.press('Enter');
  await bench.locator('button:has-text("×")').first(); // ノーオペ（存在確認は下のX削除で）
  const rowDeleteButtons = bench.locator('button:has(svg.lucide-x)');
  await rowDeleteButtons.first().click(); // 1セット目を削除
  await page.waitForTimeout(200);
  const firstWeight = await bench.locator('input').nth(0).inputValue();
  if (firstWeight !== '65') throw new Error(`set-key regression: 削除後の先頭重量が65でなく${firstWeight}`);
  await shot('03-workout.png');

  // --- 筋肉図（対象筋ハイライト）: インクラインダンベルプレス＝大胸筋上部 ---
  const incline = page.locator('div.rounded-2xl').filter({ hasText: 'インクラインダンベルプレス' }).first();
  await incline.locator('button[aria-label="対象筋を見る"]').click();
  await page.waitForSelector('text=の対象筋');
  await page.waitForTimeout(300);
  await shot('10-muscle-map.png');
  await page.locator('div.fixed.z-50 .bg-slate-200').first().click({ position: { x: 5, y: 5 } }).catch(() => {});
  await page.keyboard.press('Escape').catch(() => {});
  await page.mouse.click(10, 10); // シート外をタップして閉じる

  // --- 食事: 新規入力で追加 ---
  await tab('食事');
  await page.locator('button:has-text("追加")').first().click();
  await page.locator('button:has-text("新規入力")').click();
  await page.locator('input[placeholder="例: 鶏むね肉 100g"]').fill('鶏むね肉 200g');
  const nums = page.locator('input[placeholder="0"]');
  await nums.nth(0).fill('382');
  await nums.nth(1).fill('77');
  await nums.nth(2).fill('6');
  await nums.nth(3).fill('0');
  await page.keyboard.press('Tab');
  await page.locator('button:has-text("追加する")').click();
  await page.waitForSelector('text=382');
  await shot('04-meals.png');

  // --- 記録表 ---
  await tab('記録表');
  await page.waitForSelector('text=種目');
  await shot('05-matrix.png');

  // --- 分析 ---
  await tab('分析');
  await page.waitForSelector('text=体重・体脂肪率', { timeout: 10000 });
  await page.waitForTimeout(1800); // グラフのマウントアニメーション完了待ち
  await shot('06-stats-weight.png');
  await page.locator('button:has-text("カロリー")').click();
  await page.waitForSelector('text=摂取 vs 消費');
  await page.waitForTimeout(1800);
  await shot('07-stats-calorie.png');

  // --- ホーム最終確認（収支とPFCが反映されているか） ---
  await tab('ホーム');
  await page.waitForSelector('text=今日のカロリー収支');
  await shot('08-home-final.png');

  // --- データ管理（永続ストレージ・バックアップUI）---
  await page.locator('header button').first().click();
  await page.locator('button:has-text("バックアップ・復元")').click();
  await page.waitForSelector('text=端末内ストレージの保護');
  await shot('09-data-manager.png');
  // バックアップ書き出しで最終バックアップ日時が更新されるか
  const dl = page.waitForEvent('download');
  await page.locator('button:has-text("バックアップを書き出す")').click();
  await (await dl).cancel?.();
  await page.waitForSelector('text=最終バックアップ:');

  // --- 週間スケジュール: 今日の曜日に「脚の日」を割り当て ---
  const settingsBack2 = page.locator('div.fixed.z-40 header button');
  await settingsBack2.click(); // データ管理 → メニュー
  await page.locator('button:has-text("週間スケジュール")').click();
  await page.waitForSelector('text=曜日ごとのメニュー');
  const wd = await page.evaluate(() => new Date().getDay());
  await page.locator('select').nth(wd).selectOption({ label: '脚の日' });
  await shot('11-weekly-schedule.png');
  await settingsBack2.click(); // 週間 → メニュー
  await settingsBack2.click(); // メニュー → 閉じる

  // --- 筋トレ画面に「今日の予定」バナーが出るか ---
  await tab('筋トレ');
  await page.waitForSelector('text=曜日の予定');
  await shot('12-workout-plan.png');

  console.log(errors.length === 0 ? '✓ smoke OK (no console/page errors)' : `✗ errors:\n${errors.join('\n')}`);
} catch (e) {
  await shot('99-failure.png');
  console.error('✗ smoke failed:', e.message);
  if (errors.length) console.error(errors.join('\n'));
  process.exitCode = 1;
} finally {
  await browser.close();
}
