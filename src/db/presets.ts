import type { BodyPart } from './db';

export const BODY_PARTS: BodyPart[] = ['胸', '背中', '脚', '肩', '腕', '体幹', 'その他'];

export const PRESET_EXERCISES: { name: string; bodyPart: BodyPart }[] = [
  // 胸
  { name: 'ベンチプレス', bodyPart: '胸' },
  { name: 'インクラインベンチプレス', bodyPart: '胸' },
  { name: 'ダンベルプレス', bodyPart: '胸' },
  { name: 'インクラインダンベルプレス', bodyPart: '胸' },
  { name: 'ダンベルフライ', bodyPart: '胸' },
  { name: 'ペックフライ', bodyPart: '胸' },
  { name: 'ケーブルクロスオーバー', bodyPart: '胸' },
  { name: 'チェストプレス', bodyPart: '胸' },
  { name: 'ディップス', bodyPart: '胸' },
  { name: 'プッシュアップ', bodyPart: '胸' },
  // 背中
  { name: 'デッドリフト', bodyPart: '背中' },
  { name: '懸垂（チンニング）', bodyPart: '背中' },
  { name: 'ラットプルダウン', bodyPart: '背中' },
  { name: 'ベントオーバーロウ', bodyPart: '背中' },
  { name: 'ダンベルロウ', bodyPart: '背中' },
  { name: 'シーテッドロウ', bodyPart: '背中' },
  { name: 'Tバーロウ', bodyPart: '背中' },
  { name: 'バックエクステンション', bodyPart: '背中' },
  { name: 'シュラッグ', bodyPart: '背中' },
  // 脚
  { name: 'スクワット', bodyPart: '脚' },
  { name: 'レッグプレス', bodyPart: '脚' },
  { name: 'ブルガリアンスクワット', bodyPart: '脚' },
  { name: 'ランジ', bodyPart: '脚' },
  { name: 'レッグエクステンション', bodyPart: '脚' },
  { name: 'レッグカール', bodyPart: '脚' },
  { name: 'ルーマニアンデッドリフト', bodyPart: '脚' },
  { name: 'ヒップスラスト', bodyPart: '脚' },
  { name: 'カーフレイズ', bodyPart: '脚' },
  { name: 'アダクション', bodyPart: '脚' },
  { name: 'アブダクション', bodyPart: '脚' },
  // 肩
  { name: 'オーバーヘッドプレス', bodyPart: '肩' },
  { name: 'ダンベルショルダープレス', bodyPart: '肩' },
  { name: 'サイドレイズ', bodyPart: '肩' },
  { name: 'フロントレイズ', bodyPart: '肩' },
  { name: 'リアレイズ', bodyPart: '肩' },
  { name: 'アップライトロウ', bodyPart: '肩' },
  { name: 'フェイスプル', bodyPart: '肩' },
  // 腕
  { name: 'バーベルカール', bodyPart: '腕' },
  { name: 'ダンベルカール', bodyPart: '腕' },
  { name: 'ハンマーカール', bodyPart: '腕' },
  { name: 'インクラインダンベルカール', bodyPart: '腕' },
  { name: 'ケーブルカール', bodyPart: '腕' },
  { name: 'トライセプスプレスダウン', bodyPart: '腕' },
  { name: 'スカルクラッシャー', bodyPart: '腕' },
  { name: 'ナローベンチプレス', bodyPart: '腕' },
  { name: 'キックバック', bodyPart: '腕' },
  { name: 'リストカール', bodyPart: '腕' },
  // 体幹
  { name: 'アブローラー', bodyPart: '体幹' },
  { name: 'クランチ', bodyPart: '体幹' },
  { name: 'レッグレイズ', bodyPart: '体幹' },
  { name: 'プランク', bodyPart: '体幹' },
  { name: 'ケーブルクランチ', bodyPart: '体幹' },
  { name: 'ハンギングレッグレイズ', bodyPart: '体幹' },
  { name: 'ロシアンツイスト', bodyPart: '体幹' },
];

// 初期ルーティン（種目名で参照し、seed時にIDへ解決する）
export const PRESET_ROUTINES: { name: string; exerciseNames: string[] }[] = [
  {
    name: '胸の日',
    exerciseNames: ['ベンチプレス', 'インクラインダンベルプレス', 'ダンベルフライ', 'ケーブルクロスオーバー'],
  },
  {
    name: '背中の日',
    exerciseNames: ['デッドリフト', 'ラットプルダウン', 'ベントオーバーロウ', 'シーテッドロウ'],
  },
  {
    name: '脚の日',
    exerciseNames: ['スクワット', 'レッグプレス', 'レッグカール', 'カーフレイズ'],
  },
  {
    name: '肩・腕の日',
    exerciseNames: ['オーバーヘッドプレス', 'サイドレイズ', 'バーベルカール', 'トライセプスプレスダウン'],
  },
];
