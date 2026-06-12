# ネイティブアプリ（iOS / Android）ビルド手順

Web版（PWA）と同じコードを Capacitor で iOS / Android アプリ化しています。
このファイルは、**実機ビルド・ストア提出に必要な、手元の環境での作業**をまとめたものです。

- アプリID: `io.github.hondak00.kintore`（個人ID。提出前に確定）
- 表示名: 筋トレ管理
- 構成: Capacitor 8（iOSは Swift Package Manager。CocoaPods不要）

## 0. 必要なもの

| プラットフォーム | 必要なもの |
|---|---|
| iOS | Mac + Xcode（初回は `sudo xcodebuild -license accept`）／Apple Developer Program（$99/年） |
| Android | Android Studio + Android SDK + JDK 17／Google Play Developer（$25・買い切り） |

> このリポジトリのコードは `npm run build` で `dist/` を生成し、`npx cap sync` でネイティブへ反映します。
> `npm run open:ios` / `npm run open:android` がビルド＋同期＋IDE起動をまとめて行います。

## 1. iOS

```bash
npm run open:ios   # = build + cap sync ios + Xcodeを開く
```

Xcode で以下を設定:

1. **Signing**: Target「App」→ Signing & Capabilities → Team を自分のApple Developerアカウントに。
2. **HealthKit を有効化**（運動消費の自動取得に必須）:
   Signing & Capabilities → 「+ Capability」→ **HealthKit** を追加。
   これで `App.entitlements` に `com.apple.developer.healthkit` が付与されます。
   - 使用目的の文言は `ios/App/App/Info.plist` の `NSHealthShareUsageDescription` に設定済み。
3. **通知**: ローカル通知は実行時に許可を求めるだけで、追加設定は不要です。
4. **画面の向き**: Portrait固定済み（Info.plist）。
5. 実機を繋いで Run で動作確認 → Product → Archive → Distribute App で App Store Connect へアップロード。

## 2. Android

```bash
npm run open:android   # = build + cap sync android + Android Studioを開く
```

- **署名**: Build → Generate Signed Bundle/APK で release 用の keystore を作成し、AAB を生成。
- **Health Connect（運動消費の自動取得）**:
  - 必要な権限・権限根拠画面は `AndroidManifest.xml` に設定済み
    （`health.READ_ACTIVE_CALORIES_BURNED`、`POST_NOTIFICATIONS`、rationale用 intent-filter / activity-alias）。
  - 実機に **Health Connect アプリ**が入っている必要があります（Android 14未満はストアから導入）。
  - 未導入端末では、アプリ内の「ヘルスから取得」ボタンは自動的に非表示になります。
- Play Console にアップロードして内部テスト→製品版へ。

## 3. 動作確認のポイント（実機）

- [ ] 起動してスプラッシュ→ホームが表示される（セーフエリア・ステータスバーが崩れない）
- [ ] 設定 → リマインダー をONにして、指定時刻に通知が届く
- [ ] ホームの「ヘルスから運動消費を取得」で、ヘルスケア/Health Connectの値が入る
- [ ] 設定 → データ管理 → バックアップ書き出しで、共有シートからファイル保存できる
- [ ] バックアップから復元できる（機種変更の移行テスト）

## 4. 更新フロー

コードを変更したら `npm run open:ios` / `npm run open:android` で再同期し、
バージョン（iOS: MARKETING_VERSION / CURRENT_PROJECT_VERSION、Android: versionName / versionCode）を上げて再アップロード。

> Web版は別系統（GitHub Pages）。`main` への push で自動デプロイされます（DEPLOY.md 参照）。
> スマホ版リリース完了後にWeb版を停止する予定です（移行導線つきランディングへ差し替え）。
