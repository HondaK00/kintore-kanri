// v2→v3 マイグレーションでユーザーデータが保持され、新種目が追加されることを検証。
// db.ts のスキーマ/アップグレード処理を同一ロジックで再現する。
import 'fake-indexeddb/auto';
import Dexie from 'dexie';

const V1 = {
  profile: 'id',
  exercises: '++id, bodyPart',
  routines: '++id, sortOrder',
  workouts: '++id, date, exerciseId, [exerciseId+date]',
  foods: '++id, name, useCount',
  mealLogs: '++id, date',
  bodyLogs: '++id, &date',
  activityLogs: '++id, &date',
};
const V3_FULL = { ...V1, weeklyPlan: 'weekday' };
const EXTRA = [
  { name: 'ハックスクワット', bodyPart: '脚' },
  { name: 'マシンショルダープレス', bodyPart: '肩' },
  { name: 'ベンチプレス', bodyPart: '胸' }, // 既存と重複 → 追加されないことを確認
];

function defineUpToV2(db) {
  db.version(1).stores(V1);
  db.version(2).stores({ weeklyPlan: 'weekday' });
}
function defineV3(db) {
  defineUpToV2(db);
  db.version(3)
    .stores(V3_FULL)
    .upgrade(async (tx) => {
      const existing = new Set((await tx.table('exercises').toArray()).map((e) => e.name));
      const toAdd = EXTRA.filter((e) => !existing.has(e.name)).map((e) => ({ ...e, isPreset: true }));
      if (toAdd.length) await tx.table('exercises').bulkAdd(toAdd);
    });
}

const fail = (m) => {
  console.error('✗ ' + m);
  process.exit(1);
};

// 1) 既存ユーザーのDB(v2)を作成し、各テーブルにデータを入れる
const a = new Dexie('kintore-db');
defineUpToV2(a);
await a.open();
await a.table('exercises').bulkAdd([
  { name: 'ベンチプレス', bodyPart: '胸', isPreset: true },
  { name: '自作カール', bodyPart: '腕', isPreset: false, targetMuscles: { primary: ['biceps_long'], secondary: [] } },
]);
await a.table('workouts').add({ date: '2026-06-12', exerciseId: 1, routineId: null, sets: [{ id: 's1', weightKg: 60, reps: 10 }] });
await a.table('mealLogs').add({ date: '2026-06-12', mealType: 'lunch', name: '鶏むね', kcal: 200, protein: 40, fat: 2, carbs: 0 });
await a.table('bodyLogs').add({ date: '2026-06-12', weightKg: 70, bodyFatPct: 15 });
await a.table('weeklyPlan').put({ weekday: 5, routineId: 1 });
console.log(`  v2作成: 種目${await a.table('exercises').count()} / 記録1 / 食事1 / 体重1 / 予定1`);
await a.close();

// 2) v3を定義して開く → アップグレードが走る
const b = new Dexie('kintore-db');
defineV3(b);
await b.open();
if (b.verno !== 3) fail(`バージョンが3でない: ${b.verno}`);

// 3) データ保持の確認
const exCount = await b.table('exercises').count();
const workouts = await b.table('workouts').toArray();
const meals = await b.table('mealLogs').toArray();
const body = await b.table('bodyLogs').toArray();
const plan = await b.table('weeklyPlan').toArray();
const custom = await b.table('exercises').filter((e) => e.name === '自作カール').first();

if (workouts.length !== 1 || workouts[0].sets[0].weightKg !== 60) fail('トレーニング記録が失われた/壊れた');
if (meals.length !== 1 || meals[0].name !== '鶏むね') fail('食事記録が失われた');
if (body.length !== 1 || body[0].weightKg !== 70) fail('体重記録が失われた');
if (plan.length !== 1 || plan[0].weekday !== 5) fail('週間スケジュールが失われた');
if (!custom || custom.targetMuscles?.primary[0] !== 'biceps_long') fail('カスタム種目/対象筋が失われた');

// 4) 新種目の追加と重複除外の確認
// v2に2種目 + EXTRAから重複(ベンチプレス)を除く2種目 = 4
if (exCount !== 4) fail(`種目数が想定外: ${exCount}（期待4）`);
const names = (await b.table('exercises').toArray()).map((e) => e.name);
if (!names.includes('ハックスクワット') || !names.includes('マシンショルダープレス')) fail('新種目が追加されていない');
const benchCount = names.filter((n) => n === 'ベンチプレス').length;
if (benchCount !== 1) fail(`重複除外できていない（ベンチプレス×${benchCount}）`);

await b.close();
console.log('✓ migration OK: 全データ保持 + 新種目追加 + 重複除外を確認');
