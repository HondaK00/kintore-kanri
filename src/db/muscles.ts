import type { BodyPart } from './db';

// 筋肉の識別キー（前面・背面で塗り分け可能な粒度）
export type Muscle =
  | 'chest_upper'
  | 'chest_mid'
  | 'chest_lower'
  | 'front_delt'
  | 'side_delt'
  | 'rear_delt'
  | 'biceps_long'
  | 'biceps_short'
  | 'triceps_long'
  | 'triceps_lateral'
  | 'triceps_medial'
  | 'forearms'
  | 'abs_upper'
  | 'abs_lower'
  | 'obliques'
  | 'traps_upper'
  | 'traps_mid'
  | 'lats'
  | 'lower_back'
  | 'quads_rectus'
  | 'quads_outer'
  | 'quads_inner'
  | 'hamstrings_outer'
  | 'hamstrings_inner'
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
  biceps_long: '上腕二頭筋長頭',
  biceps_short: '上腕二頭筋短頭',
  triceps_long: '上腕三頭筋長頭',
  triceps_lateral: '上腕三頭筋外側頭',
  triceps_medial: '上腕三頭筋内側頭',
  forearms: '前腕',
  abs_upper: '腹直筋上部',
  abs_lower: '腹直筋下部',
  obliques: '腹斜筋',
  traps_upper: '僧帽筋上部',
  traps_mid: '僧帽筋中部・下部',
  lats: '広背筋',
  lower_back: '脊柱起立筋',
  quads_rectus: '大腿直筋',
  quads_outer: '外側広筋',
  quads_inner: '内側広筋',
  hamstrings_outer: '大腿二頭筋',
  hamstrings_inner: '半腱・半膜様筋',
  glutes: '臀筋',
  calves_gastro: '腓腹筋',
  calves_soleus: 'ヒラメ筋',
  adductors: '内転筋',
};

export interface MuscleTarget {
  primary: Muscle[];
  secondary: Muscle[];
}

// 筋肉群をまとめて参照するための略記（マッピング記述用）
const BICEPS: Muscle[] = ['biceps_long', 'biceps_short'];
const TRICEPS: Muscle[] = ['triceps_long', 'triceps_lateral', 'triceps_medial'];
const TRICEPS_PRESS: Muscle[] = ['triceps_lateral', 'triceps_medial']; // プレス系で主に働く頭
const QUADS: Muscle[] = ['quads_rectus', 'quads_outer', 'quads_inner'];
const HAMS: Muscle[] = ['hamstrings_outer', 'hamstrings_inner'];

// プリセット種目 → 対象筋（種目名でマッピング。種目IDはseed時に変わるため名前で参照）
export const PRESET_MUSCLE_MAP: Record<string, MuscleTarget> = {
  // 胸（インクライン=上部 / フラット=中部 / デクライン・ディップス=下部）
  ベンチプレス: { primary: ['chest_mid'], secondary: ['chest_lower', 'front_delt', ...TRICEPS_PRESS] },
  インクラインベンチプレス: { primary: ['chest_upper'], secondary: ['front_delt', ...TRICEPS_PRESS] },
  ダンベルプレス: { primary: ['chest_mid'], secondary: ['chest_lower', 'front_delt', ...TRICEPS_PRESS] },
  インクラインダンベルプレス: { primary: ['chest_upper'], secondary: ['front_delt', ...TRICEPS_PRESS] },
  ダンベルフライ: { primary: ['chest_mid'], secondary: ['chest_lower', 'front_delt'] },
  ペックフライ: { primary: ['chest_mid'], secondary: ['chest_lower', 'front_delt'] },
  ケーブルクロスオーバー: { primary: ['chest_mid'], secondary: ['chest_lower', 'front_delt'] },
  チェストプレス: { primary: ['chest_mid'], secondary: ['chest_lower', 'front_delt', ...TRICEPS_PRESS] },
  ディップス: { primary: ['chest_lower'], secondary: [...TRICEPS_PRESS, 'front_delt'] },
  プッシュアップ: { primary: ['chest_mid'], secondary: ['chest_lower', ...TRICEPS_PRESS, 'front_delt'] },
  // 背中
  デッドリフト: { primary: ['lower_back', 'glutes', ...HAMS], secondary: ['traps_upper', 'lats', 'forearms'] },
  '懸垂（チンニング）': { primary: ['lats'], secondary: [...BICEPS, 'rear_delt'] },
  ラットプルダウン: { primary: ['lats'], secondary: [...BICEPS, 'rear_delt'] },
  ベントオーバーロウ: { primary: ['lats'], secondary: ['traps_mid', 'rear_delt', ...BICEPS] },
  ダンベルロウ: { primary: ['lats'], secondary: ['traps_mid', 'rear_delt', ...BICEPS] },
  シーテッドロウ: { primary: ['lats'], secondary: ['traps_mid', 'rear_delt', ...BICEPS] },
  Tバーロウ: { primary: ['lats'], secondary: ['traps_mid', ...BICEPS] },
  バックエクステンション: { primary: ['lower_back'], secondary: ['glutes', ...HAMS] },
  シュラッグ: { primary: ['traps_upper'], secondary: ['forearms'] },
  // 脚
  スクワット: { primary: [...QUADS, 'glutes'], secondary: [...HAMS, 'lower_back'] },
  レッグプレス: { primary: [...QUADS, 'glutes'], secondary: [...HAMS] },
  ブルガリアンスクワット: { primary: [...QUADS, 'glutes'], secondary: [...HAMS] },
  ランジ: { primary: [...QUADS, 'glutes'], secondary: [...HAMS] },
  レッグエクステンション: { primary: [...QUADS], secondary: [] },
  レッグカール: { primary: [...HAMS], secondary: [] },
  ルーマニアンデッドリフト: { primary: [...HAMS, 'glutes'], secondary: ['lower_back'] },
  ヒップスラスト: { primary: ['glutes'], secondary: [...HAMS] },
  カーフレイズ: { primary: ['calves_gastro'], secondary: ['calves_soleus'] },
  アダクション: { primary: ['adductors'], secondary: [] },
  アブダクション: { primary: ['glutes'], secondary: [] },
  // 肩
  オーバーヘッドプレス: { primary: ['front_delt', 'side_delt'], secondary: [...TRICEPS, 'traps_upper'] },
  ダンベルショルダープレス: { primary: ['front_delt', 'side_delt'], secondary: [...TRICEPS] },
  サイドレイズ: { primary: ['side_delt'], secondary: [] },
  フロントレイズ: { primary: ['front_delt'], secondary: [] },
  リアレイズ: { primary: ['rear_delt'], secondary: [] },
  アップライトロウ: { primary: ['side_delt', 'traps_upper'], secondary: ['forearms'] },
  フェイスプル: { primary: ['rear_delt'], secondary: ['traps_mid'] },
  // 腕
  バーベルカール: { primary: [...BICEPS], secondary: ['forearms'] },
  ダンベルカール: { primary: [...BICEPS], secondary: ['forearms'] },
  ハンマーカール: { primary: ['biceps_long', 'forearms'], secondary: [] },
  インクラインダンベルカール: { primary: ['biceps_long'], secondary: [] },
  ケーブルカール: { primary: [...BICEPS], secondary: [] },
  トライセプスプレスダウン: { primary: ['triceps_lateral', 'triceps_medial'], secondary: [] },
  スカルクラッシャー: { primary: [...TRICEPS], secondary: [] },
  ナローベンチプレス: { primary: [...TRICEPS], secondary: ['chest_mid'] },
  キックバック: { primary: ['triceps_lateral', 'triceps_long'], secondary: [] },
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
  脚: [...QUADS],
  肩: ['side_delt'],
  腕: [...BICEPS],
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
  {
    label: '腕',
    muscles: [
      'biceps_long',
      'biceps_short',
      'triceps_long',
      'triceps_lateral',
      'triceps_medial',
      'forearms',
    ],
  },
  { label: '体幹', muscles: ['abs_upper', 'abs_lower', 'obliques'] },
  {
    label: '脚',
    muscles: [
      'quads_rectus',
      'quads_outer',
      'quads_inner',
      'hamstrings_outer',
      'hamstrings_inner',
      'glutes',
      'calves_gastro',
      'calves_soleus',
      'adductors',
    ],
  },
];
