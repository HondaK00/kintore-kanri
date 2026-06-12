// セット間レストタイマーのグローバル状態。
// タブ切替やリロードでも継続するよう、終了時刻(endsAt)をlocalStorageに永続化する。
import { scheduleRestEnd, cancelRestEnd } from '../native/notifications';

const DUR_KEY = 'kintore:rest:durationSec';
const AUTO_KEY = 'kintore:rest:autoStart';
const ENDS_KEY = 'kintore:rest:endsAt';

export interface RestState {
  endsAt: number | null; // epoch ms
  durationSec: number;
}

function loadInt(key: string, fallback: number): number {
  const v = Number(localStorage.getItem(key));
  return Number.isFinite(v) && v > 0 ? v : fallback;
}

let state: RestState = {
  endsAt: (() => {
    const v = Number(localStorage.getItem(ENDS_KEY));
    return Number.isFinite(v) && v > Date.now() ? v : null;
  })(),
  durationSec: loadInt(DUR_KEY, 90),
};

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function subscribeRest(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getRestState(): RestState {
  return state;
}

export function getRemainingSec(): number | null {
  if (state.endsAt == null) return null;
  return Math.max(0, Math.ceil((state.endsAt - Date.now()) / 1000));
}

export function isAutoStart(): boolean {
  return localStorage.getItem(AUTO_KEY) === '1';
}

export function setAutoStart(on: boolean): void {
  localStorage.setItem(AUTO_KEY, on ? '1' : '0');
  emit();
}

export function startRest(sec: number): void {
  const endsAt = Date.now() + sec * 1000;
  state = { endsAt, durationSec: sec };
  localStorage.setItem(DUR_KEY, String(sec));
  localStorage.setItem(ENDS_KEY, String(endsAt));
  emit();
  void scheduleRestEnd(sec); // 画面ロック中でも届くようネイティブ通知も予約
}

export function adjustRest(deltaSec: number): void {
  if (state.endsAt == null) return;
  const endsAt = Math.max(Date.now() + 1000, state.endsAt + deltaSec * 1000);
  state = { ...state, endsAt };
  localStorage.setItem(ENDS_KEY, String(endsAt));
  emit();
  void scheduleRestEnd(Math.ceil((endsAt - Date.now()) / 1000));
}

export function stopRest(): void {
  state = { ...state, endsAt: null };
  localStorage.removeItem(ENDS_KEY);
  emit();
  void cancelRestEnd();
}

/** セット追加時の自動スタート。実行中でなく、自動設定ONのときのみ */
export function maybeAutoStartRest(): void {
  if (isAutoStart() && state.endsAt == null) startRest(state.durationSec);
}

export function fmtSec(sec: number): string {
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
}
