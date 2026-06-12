import type { BodyPart } from './db';

// 筋肉の識別キー（前面・背面で塗り分け可能な粒度）
export type Muscle =
  | 'chest_upper'
  | 'chest'
  | 'front_delt'
  | 'side_delt'
  | 'rear_delt'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'abs'
  | 'obliques'
  | 'traps'
  | 'lats'
  | 'lower_back'
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'adductors';

export const MUSCLE_LABELS: Record<Muscle, string> = {
  chest_upper: '大胸筋上部',
  chest: '大胸筋',
  front_delt: '三角筋前部',
  side_delt: '三角筋中部',
  rear_delt: '三角筋後部',
  biceps: '上腕二頭筋',
  triceps: '上腕三頭筋',
  forearms: '前腕',
  abs: '腹直筋',
  obliques: '腹斜筋',
  traps: '僧帽筋',
  lats: '広背筋',
  lower_back: '脊柱起立筋',
  quads: '大腿四頭筋',
  hamstrings: 'ハムストリング',
  glutes: '臀筋',
  calves: '下腿三頭筋',
  adductors: '内転筋',
};

export interface MuscleTarget {
  primary: Muscle[];
  secondary: Muscle[];
}

// プリセット種目 → 対象筋（種目名でマッピング。種目IDはseed時に変わるため名前で参照）
export const PRESET_MUSCLE_MAP: Record<string, MuscleTarget> = {
  // 胸
  ベンチプレス: { primary: ['chest'], secondary: ['front_delt', 'triceps'] },
  インクラインベンチプレス: { primary: ['chest_upper'], secondary: ['front_delt', 'triceps'] },
  ダンベルプレス: { primary: ['chest'], secondary: ['front_delt', 'triceps'] },
  インクラインダンベルプレス: { primary: ['chest_upper'], secondary: ['front_delt', 'triceps'] },
  ダンベルフライ: { primary: ['chest'], secondary: ['front_delt'] },
  ペックフライ: { primary: ['chest'], secondary: ['front_delt'] },
  ケーブルクロスオーバー: { primary: ['chest'], secondary: ['front_delt'] },
  チェストプレス: { primary: ['chest'], secondary: ['front_delt', 'triceps'] },
  ディップス: { primary: ['chest'], secondary: ['triceps', 'front_delt'] },
  プッシュアップ: { primary: ['chest'], secondary: ['triceps', 'front_delt'] },
  // 背中
  デッドリフト: { primary: ['lower_back', 'glutes', 'hamstrings'], secondary: ['traps', 'lats', 'forearms'] },
  '懸垂（チンニング）': { primary: ['lats'], secondary: ['biceps', 'rear_delt'] },
  ラットプルダウン: { primary: ['lats'], secondary: ['biceps', 'rear_delt'] },
  ベントオーバーロウ: { primary: ['lats'], secondary: ['traps', 'rear_delt', 'biceps'] },
  ダンベルロウ: { primary: ['lats'], secondary: ['rear_delt', 'biceps'] },
  シーテッドロウ: { primary: ['lats'], secondary: ['traps', 'rear_delt', 'biceps'] },
  Tバーロウ: { primary: ['lats'], secondary: ['traps', 'biceps'] },
  バックエクステンション: { primary: ['lower_back'], secondary: ['glutes', 'hamstrings'] },
  シュラッグ: { primary: ['traps'], secondary: ['forearms'] },
  // 脚
  スクワット: { primary: ['quads', 'glutes'], secondary: ['hamstrings', 'lower_back'] },
  レッグプレス: { primary: ['quads', 'glutes'], secondary: ['hamstrings'] },
  ブルガリアンスクワット: { primary: ['quads', 'glutes'], secondary: ['hamstrings'] },
  ランジ: { primary: ['quads', 'glutes'], secondary: ['hamstrings'] },
  レッグエクステンション: { primary: ['quads'], secondary: [] },
  レッグカール: { primary: ['hamstrings'], secondary: [] },
  ルーマニアンデッドリフト: { primary: ['hamstrings', 'glutes'], secondary: ['lower_back'] },
  ヒップスラスト: { primary: ['glutes'], secondary: ['hamstrings'] },
  カーフレイズ: { primary: ['calves'], secondary: [] },
  アダクション: { primary: ['adductors'], secondary: [] },
  アブダクション: { primary: ['glutes'], secondary: [] },
  // 肩
  オーバーヘッドプレス: { primary: ['front_delt', 'side_delt'], secondary: ['triceps', 'traps'] },
  ダンベルショルダープレス: { primary: ['front_delt', 'side_delt'], secondary: ['triceps'] },
  サイドレイズ: { primary: ['side_delt'], secondary: [] },
  フロントレイズ: { primary: ['front_delt'], secondary: [] },
  リアレイズ: { primary: ['rear_delt'], secondary: [] },
  アップライトロウ: { primary: ['side_delt', 'traps'], secondary: ['biceps'] },
  フェイスプル: { primary: ['rear_delt'], secondary: ['traps'] },
  // 腕
  バーベルカール: { primary: ['biceps'], secondary: ['forearms'] },
  ダンベルカール: { primary: ['biceps'], secondary: ['forearms'] },
  ハンマーカール: { primary: ['biceps', 'forearms'], secondary: [] },
  インクラインダンベルカール: { primary: ['biceps'], secondary: [] },
  ケーブルカール: { primary: ['biceps'], secondary: [] },
  トライセプスプレスダウン: { primary: ['triceps'], secondary: [] },
  スカルクラッシャー: { primary: ['triceps'], secondary: [] },
  ナローベンチプレス: { primary: ['triceps'], secondary: ['chest'] },
  キックバック: { primary: ['triceps'], secondary: [] },
  リストカール: { primary: ['forearms'], secondary: [] },
  // 体幹
  アブローラー: { primary: ['abs'], secondary: ['obliques'] },
  クランチ: { primary: ['abs'], secondary: [] },
  レッグレイズ: { primary: ['abs'], secondary: ['obliques'] },
  プランク: { primary: ['abs'], secondary: ['obliques'] },
  ケーブルクランチ: { primary: ['abs'], secondary: [] },
  ハンギングレッグレイズ: { primary: ['abs'], secondary: ['obliques'] },
  ロシアンツイスト: { primary: ['obliques'], secondary: ['abs'] },
};

// カスタム種目で対象筋が未設定のときの、部位ごとの既定ハイライト
const BODY_PART_DEFAULT: Record<BodyPart, Muscle[]> = {
  胸: ['chest'],
  背中: ['lats'],
  脚: ['quads'],
  肩: ['side_delt'],
  腕: ['biceps'],
  体幹: ['abs'],
  その他: [],
};

/** 種目から対象筋を解決する。明示設定 > プリセット名マップ > 部位デフォルト */
export function resolveMuscles(ex: {
  name: string;
  bodyPart: BodyPart;
  targetMuscles?: MuscleTarget | null;
}): MuscleTarget {
  if (ex.targetMuscles && ex.targetMuscles.primary.length > 0) return ex.targetMuscles;
  const preset = PRESET_MUSCLE_MAP[ex.name];
  if (preset) return preset;
  return { primary: BODY_PART_DEFAULT[ex.bodyPart] ?? [], secondary: [] };
}

// 筋肉選択UI用のグルーピング
export const MUSCLE_GROUPS: { label: string; muscles: Muscle[] }[] = [
  { label: '胸', muscles: ['chest_upper', 'chest'] },
  { label: '肩', muscles: ['front_delt', 'side_delt', 'rear_delt'] },
  { label: '背中', muscles: ['traps', 'lats', 'lower_back'] },
  { label: '腕', muscles: ['biceps', 'triceps', 'forearms'] },
  { label: '体幹', muscles: ['abs', 'obliques'] },
  { label: '脚', muscles: ['quads', 'hamstrings', 'glutes', 'calves', 'adductors'] },
];
