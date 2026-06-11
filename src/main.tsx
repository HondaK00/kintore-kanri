import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Capacitor } from '@capacitor/core';
import { registerSW } from 'virtual:pwa-register';
import './index.css';
import App from './App';
import { initNative } from './native/bridge';
import { requestPersistentStorage } from './lib/storage';

if (Capacitor.isNativePlatform()) {
  // ネイティブ(Capacitor)ではSWは不要。ステータスバー等のネイティブ初期化を行う
  void initNative();
} else {
  // Web(PWA)ではService Workerでオフライン対応
  registerSW({ immediate: true });
}

// データ消失防止: ブラウザの自動削除を抑止する永続ストレージを要求
void requestPersistentStorage();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
