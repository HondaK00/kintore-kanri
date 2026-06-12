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

  // 胸（追加種目）
  'マシンインクラインチェストプレス': { primary: ['chest_upper'], secondary: ['front_delt', 'triceps_lateral', 'triceps_medial'] },
  'マシンデクラインチェストプレス': { primary: ['chest_lower'], secondary: ['front_delt', 'triceps_lateral', 'triceps_medial'] },
  'スミスマシンベンチプレス': { primary: ['chest_mid'], secondary: ['front_delt', 'triceps_lateral', 'triceps_medial'] },
  'スミスマシンインクラインベンチプレス': { primary: ['chest_upper'], secondary: ['front_delt', 'triceps_lateral', 'triceps_medial'] },
  'スミスマシンデクラインベンチプレス': { primary: ['chest_lower'], secondary: ['front_delt', 'triceps_lateral', 'triceps_medial'] },
  'バーベルデクラインベンチプレス': { primary: ['chest_lower'], secondary: ['front_delt', 'triceps_lateral', 'triceps_medial'] },
  'バーベルプルオーバー': { primary: ['chest_mid'], secondary: ['lats', 'triceps_long'] },
  'ダンベルプルオーバー': { primary: ['chest_mid'], secondary: ['lats', 'triceps_long'] },
  'デクラインダンベルプレス': { primary: ['chest_lower'], secondary: ['front_delt', 'triceps_lateral', 'triceps_medial'] },
  'デクラインダンベルフライ': { primary: ['chest_lower'], secondary: ['front_delt'] },
  'インクラインダンベルフライ': { primary: ['chest_upper'], secondary: ['front_delt'] },
  'ローケーブルクロスオーバー': { primary: ['chest_upper'], secondary: ['front_delt'] },
  'ハイケーブルクロスオーバー': { primary: ['chest_lower'], secondary: ['front_delt'] },
  'ケーブルフライ': { primary: ['chest_mid'], secondary: ['front_delt'] },
  'インクラインケーブルフライ': { primary: ['chest_upper'], secondary: ['front_delt'] },
  'シーテッドケーブルチェストプレス': { primary: ['chest_mid'], secondary: ['front_delt', 'triceps_lateral', 'triceps_medial'] },
  'スミスマシンナローグリップベンチプレス': { primary: ['chest_mid'], secondary: ['triceps_lateral', 'triceps_long', 'front_delt'] },
  'インクラインプッシュアップ': { primary: ['chest_lower'], secondary: ['front_delt', 'triceps_lateral', 'triceps_medial'] },
  'デクラインプッシュアップ': { primary: ['chest_upper'], secondary: ['front_delt', 'triceps_lateral', 'triceps_medial'] },
  'ワイドプッシュアップ': { primary: ['chest_mid'], secondary: ['front_delt', 'triceps_lateral'] },
  'スベンドプレス': { primary: ['chest_mid'], secondary: ['front_delt', 'triceps_medial'] },
  'フロアプレス': { primary: ['chest_mid'], secondary: ['triceps_lateral', 'triceps_medial', 'front_delt'] },
  'ダンベルフロアプレス': { primary: ['chest_mid'], secondary: ['triceps_lateral', 'triceps_medial', 'front_delt'] },
  'アーチャープッシュアップ': { primary: ['chest_mid'], secondary: ['front_delt', 'triceps_lateral'] },
  // 背中（追加種目）
  'ワイドグリップラットプルダウン': { primary: ['lats'], secondary: ['traps_mid', 'biceps_long', 'rear_delt'] },
  'リバースグリップラットプルダウン': { primary: ['lats'], secondary: ['biceps_short', 'biceps_long', 'traps_mid'] },
  'ビハインドネックプルダウン': { primary: ['lats'], secondary: ['traps_mid', 'rear_delt'] },
  'ストレートアームプルダウン': { primary: ['lats'], secondary: ['triceps_long', 'rear_delt'] },
  'ケーブルプルオーバー': { primary: ['lats'], secondary: ['triceps_long', 'chest_lower'] },
  'アシストチンニング': { primary: ['lats'], secondary: ['biceps_long', 'biceps_short', 'traps_mid'] },
  'マシンロウ': { primary: ['lats', 'traps_mid'], secondary: ['rear_delt', 'biceps_long'] },
  'ハイロウ': { primary: ['lats', 'traps_mid'], secondary: ['rear_delt', 'biceps_long'] },
  'ロープロウ': { primary: ['lats', 'traps_mid'], secondary: ['biceps_long', 'rear_delt'] },
  'インバーテッドロウ': { primary: ['lats', 'traps_mid'], secondary: ['rear_delt', 'biceps_long'] },
  'ペンドレイロウ': { primary: ['lats', 'traps_mid'], secondary: ['rear_delt', 'lower_back', 'biceps_long'] },
  'チェストサポーテッドロウ': { primary: ['traps_mid', 'lats'], secondary: ['rear_delt', 'biceps_long'] },
  'ワンハンドケーブルロウ': { primary: ['lats', 'traps_mid'], secondary: ['rear_delt', 'biceps_long'] },
  'インクラインダンベルロウ': { primary: ['lats', 'traps_mid'], secondary: ['rear_delt', 'biceps_long'] },
  'ラックプル': { primary: ['traps_mid', 'lower_back'], secondary: ['traps_upper', 'lats', 'glutes', 'hamstrings_outer'] },
  'グッドモーニング': { primary: ['lower_back'], secondary: ['hamstrings_outer', 'hamstrings_inner', 'glutes'] },
  'ニュートラルグリッププルダウン': { primary: ['lats'], secondary: ['biceps_long', 'traps_mid', 'rear_delt'] },
  'マシンプルオーバー': { primary: ['lats'], secondary: ['triceps_long', 'chest_lower'] },
  // 脚（追加種目）
  'ハックスクワット': { primary: ['quads_rectus', 'quads_outer', 'quads_inner'], secondary: ['glutes', 'hamstrings_outer'] },
  'スミスマシンスクワット': { primary: ['quads_rectus', 'quads_outer', 'quads_inner', 'glutes'], secondary: ['hamstrings_outer', 'lower_back'] },
  'フロントスクワット': { primary: ['quads_rectus', 'quads_outer', 'quads_inner'], secondary: ['glutes', 'lower_back'] },
  'ゴブレットスクワット': { primary: ['quads_rectus', 'quads_outer', 'quads_inner'], secondary: ['glutes', 'adductors'] },
  'シシースクワット': { primary: ['quads_rectus', 'quads_outer', 'quads_inner'], secondary: [] },
  'ステップアップ': { primary: ['quads_rectus', 'glutes'], secondary: ['quads_outer', 'hamstrings_outer'] },
  'ウォーキングランジ': { primary: ['quads_rectus', 'glutes'], secondary: ['hamstrings_outer', 'adductors'] },
  'サイドランジ': { primary: ['adductors', 'glutes'], secondary: ['quads_inner', 'quads_rectus'] },
  'スティフレッグデッドリフト': { primary: ['hamstrings_outer', 'hamstrings_inner'], secondary: ['glutes', 'lower_back'] },
  'グルートハムレイズ': { primary: ['hamstrings_outer', 'hamstrings_inner'], secondary: ['glutes', 'calves_gastro'] },
  'スタンディングカーフレイズ': { primary: ['calves_gastro'], secondary: ['calves_soleus'] },
  'シーテッドカーフレイズ': { primary: ['calves_soleus'], secondary: ['calves_gastro'] },
  'レッグプレスカーフレイズ': { primary: ['calves_gastro', 'calves_soleus'], secondary: [] },
  'ドンキーカーフレイズ': { primary: ['calves_gastro'], secondary: ['calves_soleus'] },
  'グルートキックバック': { primary: ['glutes'], secondary: ['hamstrings_outer'] },
  'ケーブルプルスルー': { primary: ['glutes'], secondary: ['hamstrings_outer', 'lower_back'] },
  'ケーブルキックバック': { primary: ['glutes'], secondary: ['hamstrings_outer'] },
  'ピストルスクワット': { primary: ['quads_rectus', 'glutes'], secondary: ['quads_outer', 'quads_inner', 'adductors'] },
  'ナローレッグプレス': { primary: ['quads_outer', 'quads_rectus'], secondary: ['glutes'] },
  'ワイドレッグプレス': { primary: [...QUADS, 'glutes'], secondary: ['adductors', 'hamstrings_outer'] },
  'ペンデュラムスクワット': { primary: ['quads_rectus', 'quads_outer', 'quads_inner'], secondary: ['glutes'] },
  'スレッドプッシュ': { primary: ['quads_rectus', 'glutes'], secondary: ['calves_gastro', 'hamstrings_outer'] },
  // 肩（追加種目）
  'マシンショルダープレス': { primary: ['front_delt', 'side_delt'], secondary: ['triceps_long', 'triceps_lateral', 'traps_upper'] },
  'スミスマシンショルダープレス': { primary: ['front_delt', 'side_delt'], secondary: ['triceps_long', 'triceps_lateral', 'traps_upper'] },
  'サイドレイズマシン': { primary: ['side_delt'], secondary: ['traps_upper'] },
  'リアデルトフライマシン': { primary: ['rear_delt'], secondary: ['traps_mid'] },
  'アーノルドプレス': { primary: ['front_delt', 'side_delt'], secondary: ['triceps_long', 'traps_upper'] },
  'ビハインドネックプレス': { primary: ['side_delt', 'front_delt'], secondary: ['triceps_long', 'traps_upper'] },
  'プッシュプレス': { primary: ['front_delt', 'side_delt'], secondary: ['triceps_long', 'triceps_lateral', 'traps_upper', 'quads_rectus'] },
  'ケーブルサイドレイズ': { primary: ['side_delt'], secondary: ['traps_upper'] },
  'ケーブルフロントレイズ': { primary: ['front_delt'], secondary: ['chest_upper'] },
  'ケーブルリアレイズ': { primary: ['rear_delt'], secondary: ['traps_mid'] },
  'ライイングサイドレイズ': { primary: ['side_delt'], secondary: ['rear_delt'] },
  'インクラインサイドレイズ': { primary: ['side_delt'], secondary: ['rear_delt'] },
  'ベントオーバーリアレイズ': { primary: ['rear_delt'], secondary: ['traps_mid', 'traps_upper'] },
  'インクラインリアレイズ': { primary: ['rear_delt'], secondary: ['traps_mid'] },
  'ケーブルアップライトロウ': { primary: ['side_delt', 'front_delt'], secondary: ['traps_upper', 'biceps_short'] },
  'プレートフロントレイズ': { primary: ['front_delt'], secondary: ['chest_upper'] },
  'ランドマインプレス': { primary: ['front_delt'], secondary: ['side_delt', 'triceps_long', 'chest_upper'] },
  'パイクプッシュアップ': { primary: ['front_delt', 'side_delt'], secondary: ['triceps_long', 'triceps_lateral', 'traps_upper'] },
  'ハンドスタンドプッシュアップ': { primary: ['front_delt', 'side_delt'], secondary: ['triceps_long', 'triceps_lateral', 'traps_upper'] },
  'ケーブルワンアームショルダープレス': { primary: ['front_delt', 'side_delt'], secondary: ['triceps_long', 'traps_upper'] },
  'リーニングケーブルサイドレイズ': { primary: ['side_delt'], secondary: ['traps_upper'] },
  'Yレイズ': { primary: ['traps_mid', 'rear_delt', 'front_delt'], secondary: ['side_delt'] },
  // 腕（追加種目）
  'プリーチャーカール': { primary: ['biceps_short'], secondary: ['biceps_long', 'forearms'] },
  'スパイダーカール': { primary: ['biceps_short'], secondary: ['biceps_long', 'forearms'] },
  'コンセントレーションカール': { primary: ['biceps_short'], secondary: ['biceps_long', 'forearms'] },
  'リバースカール': { primary: ['forearms'], secondary: ['biceps_short', 'biceps_long'] },
  'マシンカール': { primary: ['biceps_short', 'biceps_long'], secondary: ['forearms'] },
  'ケーブルハンマーカール': { primary: ['biceps_long', 'forearms'], secondary: ['biceps_short'] },
  'ドラッグカール': { primary: ['biceps_long'], secondary: ['biceps_short', 'forearms'] },
  'ゾットマンカール': { primary: ['biceps_short', 'forearms'], secondary: ['biceps_long'] },
  'ライイングトライセプスエクステンション': { primary: ['triceps_long', 'triceps_lateral'], secondary: ['triceps_medial'] },
  'オーバーヘッドトライセプスエクステンション': { primary: ['triceps_long'], secondary: ['triceps_lateral', 'triceps_medial'] },
  'ケーブルオーバーヘッドエクステンション': { primary: ['triceps_long'], secondary: ['triceps_lateral', 'triceps_medial'] },
  'ロープトライセプスプレスダウン': { primary: ['triceps_lateral', 'triceps_medial'], secondary: ['triceps_long'] },
  'トライセプスエクステンションマシン': { primary: ['triceps_lateral', 'triceps_medial', 'triceps_long'], secondary: [] },
  'ディップスマシン': { primary: ['triceps_lateral', 'triceps_medial'], secondary: ['triceps_long', 'chest_lower', 'front_delt'] },
  'ベンチディップス': { primary: ['triceps_long', 'triceps_lateral', 'triceps_medial'], secondary: ['front_delt', 'chest_lower'] },
  'JMプレス': { primary: ['triceps_long', 'triceps_lateral'], secondary: ['triceps_medial', 'front_delt'] },
  'ダイヤモンドプッシュアップ': { primary: ['triceps_lateral', 'triceps_medial', 'triceps_long'], secondary: ['chest_mid', 'front_delt'] },
  'リバースリストカール': { primary: ['forearms'], secondary: [] },
  'ビハインドザバックリストカール': { primary: ['forearms'], secondary: [] },
  'ケーブルリバースカール': { primary: ['forearms'], secondary: ['biceps_short', 'biceps_long'] },
  'ワンアームケーブルカール': { primary: ['biceps_short', 'biceps_long'], secondary: ['forearms'] },
  // 体幹（追加種目）
  'アブクランチマシン': { primary: ['abs_upper', 'abs_lower'], secondary: ['obliques'] },
  'トルソローテーション': { primary: ['obliques'], secondary: ['abs_upper', 'abs_lower'] },
  'ケーブルウッドチョッパー': { primary: ['obliques'], secondary: ['abs_upper', 'front_delt'] },
  'ケーブルパロフプレス': { primary: ['obliques'], secondary: ['abs_upper', 'abs_lower'] },
  'ダンベルサイドベンド': { primary: ['obliques'], secondary: ['lower_back'] },
  'デクラインシットアップ': { primary: ['abs_upper', 'abs_lower'], secondary: ['obliques'] },
  'シットアップ': { primary: ['abs_upper'], secondary: ['abs_lower', 'obliques'] },
  'バイシクルクランチ': { primary: ['obliques', 'abs_lower'], secondary: ['abs_upper'] },
  'Vアップ': { primary: ['abs_lower', 'abs_upper'], secondary: ['quads_rectus'] },
  'サイドプランク': { primary: ['obliques'], secondary: ['abs_upper', 'glutes'] },
  'デッドバグ': { primary: ['abs_lower', 'abs_upper'], secondary: ['obliques'] },
  'バードドッグ': { primary: ['lower_back'], secondary: ['glutes', 'abs_lower'] },
  'マウンテンクライマー': { primary: ['abs_lower'], secondary: ['obliques', 'abs_upper'] },
  'ニートゥチェスト': { primary: ['abs_lower'], secondary: ['abs_upper', 'obliques'] },
  'ドラゴンフラッグ': { primary: ['abs_lower', 'abs_upper'], secondary: ['lats', 'obliques'] },
  'ケーブルトランクツイスト': { primary: ['obliques'], secondary: ['abs_upper'] },
  'メディシンボールツイスト': { primary: ['obliques'], secondary: ['abs_upper'] },
  'ヒールタッチ': { primary: ['obliques'], secondary: ['abs_upper'] },
  'プランクレッグレイズ': { primary: ['abs_lower'], secondary: ['glutes', 'obliques'] },
  'バーベルロールアウト': { primary: ['abs_upper', 'abs_lower'], secondary: ['lats', 'obliques'] },
  'ケーブルサイドベンド': { primary: ['obliques'], secondary: ['lower_back'] },
  'リバースクランチ': { primary: ['abs_lower'], secondary: ['obliques'] },
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
