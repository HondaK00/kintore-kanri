import type { BodyPart } from './db';

// 筋肉の識別キー（前面・背面で塗り分け可能な粒度）
export type Muscle =
  | 'chest_upper'
  | 'chest_mid'
  | 'chest_lower'
  | 'front_delt'
  | 'side_delt'
  | 'rear_delt'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'abs_upper'
  | 'abs_lower'
  | 'obliques'
  | 'traps_upper'
  | 'traps_mid'
  | 'lats'
  | 'lower_back'
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'calves_gastro'
  | 'calves_soleus'
  | 'adductors';

export const MUSCLE_LABELS: Record<Muscle, string> = {
  chest_upper: '大胸筋上部',
  chest_mid: '大胸筋中部',
  chest_lower: '大胸筋下部',
  front_delt: '三角筋前部',
  side_delt: '三角筋中部',
  rear_delt: '三角筋後部',
  biceps: '上腕二頭筋',
  triceps: '上腕三頭筋',
  forearms: '前腕',
  abs_upper: '腹直筋上部',
  abs_lower: '腹直筋下部',
  obliques: '腹斜筋',
  traps_upper: '僧帽筋上部',
  traps_mid: '僧帽筋中部・下部',
  lats: '広背筋',
  lower_back: '脊柱起立筋',
  quads: '大腿四頭筋',
  hamstrings: 'ハムストリング',
  glutes: '臀筋',
  calves_gastro: '腓腹筋',
  calves_soleus: 'ヒラメ筋',
  adductors: '内転筋',
};

export interface MuscleTarget {
  primary: Muscle[];
  secondary: Muscle[];
}

// プリセット種目 → 対象筋（種目名でマッピング。種目IDはseed時に変わるため名前で参照）
export const PRESET_MUSCLE_MAP: Record<string, MuscleTarget> = {
  // 胸（インクライン=上部 / フラット=中部 / デクライン・ディップス=下部）
  ベンチプレス: { primary: ['chest_mid'], secondary: ['chest_lower', 'front_delt', 'triceps'] },
  インクラインベンチプレス: { primary: ['chest_upper'], secondary: ['front_delt', 'triceps'] },
  ダンベルプレス: { primary: ['chest_mid'], secondary: ['chest_lower', 'front_delt', 'triceps'] },
  インクラインダンベルプレス: { primary: ['chest_upper'], secondary: ['front_delt', 'triceps'] },
  ダンベルフライ: { primary: ['chest_mid'], secondary: ['chest_lower', 'front_delt'] },
  ペックフライ: { primary: ['chest_mid'], secondary: ['chest_lower', 'front_delt'] },
  ケーブルクロスオーバー: { primary: ['chest_mid'], secondary: ['chest_lower', 'front_delt'] },
  チェストプレス: { primary: ['chest_mid'], secondary: ['chest_lower', 'front_delt', 'triceps'] },
  ディップス: { primary: ['chest_lower'], secondary: ['triceps', 'front_delt'] },
  プッシュアップ: { primary: ['chest_mid'], secondary: ['chest_lower', 'triceps', 'front_delt'] },
  // 背中
  デッドリフト: { primary: ['lower_back', 'glutes', 'hamstrings'], secondary: ['traps_upper', 'lats', 'forearms'] },
  '懸垂（チンニング）': { primary: ['lats'], secondary: ['biceps', 'rear_delt'] },
  ラットプルダウン: { primary: ['lats'], secondary: ['biceps', 'rear_delt'] },
  ベントオーバーロウ: { primary: ['lats'], secondary: ['traps_mid', 'rear_delt', 'biceps'] },
  ダンベルロウ: { primary: ['lats'], secondary: ['traps_mid', 'rear_delt', 'biceps'] },
  シーテッドロウ: { primary: ['lats'], secondary: ['traps_mid', 'rear_delt', 'biceps'] },
  Tバーロウ: { primary: ['lats'], secondary: ['traps_mid', 'biceps'] },
  バックエクステンション: { primary: ['lower_back'], secondary: ['glutes', 'hamstrings'] },
  シュラッグ: { primary: ['traps_upper'], secondary: ['forearms'] },
  // 脚
  スクワット: { primary: ['quads', 'glutes'], secondary: ['hamstrings', 'lower_back'] },
  レッグプレス: { primary: ['quads', 'glutes'], secondary: ['hamstrings'] },
  ブルガリアンスクワット: { primary: ['quads', 'glutes'], secondary: ['hamstrings'] },
  ランジ: { primary: ['quads', 'glutes'], secondary: ['hamstrings'] },
  レッグエクステンション: { primary: ['quads'], secondary: [] },
  レッグカール: { primary: ['hamstrings'], secondary: [] },
  ルーマニアンデッドリフト: { primary: ['hamstrings', 'glutes'], secondary: ['lower_back'] },
  ヒップスラスト: { primary: ['glutes'], secondary: ['hamstrings'] },
  カーフレイズ: { primary: ['calves_gastro'], secondary: ['calves_soleus'] },
  アダクション: { primary: ['adductors'], secondary: [] },
  アブダクション: { primary: ['glutes'], secondary: [] },
  // 肩
  オーバーヘッドプレス: { primary: ['front_delt', 'side_delt'], secondary: ['triceps', 'traps_upper'] },
  ダンベルショルダープレス: { primary: ['front_delt', 'side_delt'], secondary: ['triceps'] },
  サイドレイズ: { primary: ['side_delt'], secondary: [] },
  フロントレイズ: { primary: ['front_delt'], secondary: [] },
  リアレイズ: { primary: ['rear_delt'], secondary: [] },
  アップライトロウ: { primary: ['side_delt', 'traps_upper'], secondary: ['biceps'] },
  フェイスプル: { primary: ['rear_delt'], secondary: ['traps_mid'] },
  // 腕
  バーベルカール: { primary: ['biceps'], secondary: ['forearms'] },
  ダンベルカール: { primary: ['biceps'], secondary: ['forearms'] },
  ハンマーカール: { primary: ['biceps', 'forearms'], secondary: [] },
  インクラインダンベルカール: { primary: ['biceps'], secondary: [] },
  ケーブルカール: { primary: ['biceps'], secondary: [] },
  トライセプスプレスダウン: { primary: ['triceps'], secondary: [] },
  スカルクラッシャー: { primary: ['triceps'], secondary: [] },
  ナローベンチプレス: { primary: ['triceps'], secondary: ['chest_mid'] },
  キックバック: { primary: ['triceps'], secondary: [] },
  リストカール: { primary: ['forearms'], secondary: [] },
  // 体幹（クランチ系=上部 / レッグレイズ系=下部）
  アブローラー: { primary: ['abs_upper', 'abs_lower'], secondary: ['obliques'] },
  クランチ: { primary: ['abs_upper'], secondary: ['abs_lower'] },
  レッグレイズ: { primary: ['abs_lower'], secondary: ['obliques'] },
  プランク: { primary: ['abs_upper', 'abs_lower'], secondary: ['obliques'] },
  ケーブルクランチ: { primary: ['abs_upper'], secondary: ['abs_lower'] },
  ハンギングレッグレイズ: { primary: ['abs_lower'], secondary: ['obliques'] },
  ロシアンツイスト: { primary: ['obliques'], secondary: ['abs_lower'] },
};

// カスタム種目で対象筋が未設定のときの、部位ごとの既定ハイライト
const BODY_PART_DEFAULT: Record<BodyPart, Muscle[]> = {
  胸: ['chest_mid'],
  背中: ['lats'],
  脚: ['quads'],
  肩: ['side_delt'],
  腕: ['biceps'],
  体幹: ['abs_upper', 'abs_lower'],
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

/** 種目が手動設定の対象筋を持つか（内蔵設定の上書き中か） */
export function hasManualMuscles(ex: { targetMuscles?: MuscleTarget | null }): boolean {
  return !!ex.targetMuscles && ex.targetMuscles.primary.length > 0;
}

// 筋肉選択UI用のグルーピング
export const MUSCLE_GROUPS: { label: string; muscles: Muscle[] }[] = [
  { label: '胸', muscles: ['chest_upper', 'chest_mid', 'chest_lower'] },
  { label: '肩', muscles: ['front_delt', 'side_delt', 'rear_delt'] },
  { label: '背中', muscles: ['traps_upper', 'traps_mid', 'lats', 'lower_back'] },
  { label: '腕', muscles: ['biceps', 'triceps', 'forearms'] },
  { label: '体幹', muscles: ['abs_upper', 'abs_lower', 'obliques'] },
  { label: '脚', muscles: ['quads', 'hamstrings', 'glutes', 'calves_gastro', 'calves_soleus', 'adductors'] },
];
