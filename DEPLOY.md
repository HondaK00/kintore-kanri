# Web版（PWA）のリリース手順

スマホ対応のWeb版を、無料のHTTPS静的ホスティングに公開する手順です。
所要時間は約5〜10分。**サーバー管理不要・運用コストゼロ**で運用できます。

> 前提: PWAをスマホのホーム画面に「アプリとして」追加するには **HTTPS** での配信が必須です。
> 以下のどのホスティングも無料でHTTPSが付きます。

ビルド成果物は `dist/`（`npm run build` で生成）です。リポジトリには `vercel.json` と
`netlify.toml` を同梱済みなので、VercelかNetlifyならビルド設定は自動認識されます。

---

## 選択肢A: Cloudflare Pages（推奨・無料枠が最も寛大）

**GitリポジトリをつなぐGUI方式（おすすめ）**

1. コードをGitHubにpush（未設定なら `git init && git add -A && git commit` → GitHubにリポジトリ作成 → push）
2. https://dash.cloudflare.com → Workers & Pages → Create → Pages → Connect to Git
3. リポジトリを選択し、ビルド設定を入力:
   - Framework preset: `None`
   - Build command: `npm run build`
   - Build output directory: `dist`
4. Save and Deploy → 数分で `https://<プロジェクト名>.pages.dev` が発行されます

**CLI方式（Gitなしで即公開）**

```bash
npm run build
npx wrangler pages deploy dist --project-name kintore-kanri
# 初回はブラウザでCloudflareログインを求められます（無料アカウントでOK）
```

---

## 選択肢B: Vercel（CLIが最速）

```bash
npm i -g vercel        # 未インストールなら
npm run build
vercel --prod          # 初回はログイン＆プロジェクト名を聞かれるだけ
```

`vercel.json` を同梱済みなので、SPAフォールバックとキャッシュ設定は自動適用されます。
発行URL: `https://<プロジェクト名>.vercel.app`

---

## 選択肢C: Netlify

```bash
npm i -g netlify-cli   # 未インストールなら
npm run build
netlify deploy --prod --dir=dist
```

`netlify.toml` を同梱済み。GUIで使う場合は Netlify に GitHub リポジトリを連携すれば自動ビルドされます。

---

## 独自ドメインを使う場合（任意）

どのホスティングでも、ダッシュボードの「Custom domain」から
お好みの独自ドメイン（例: `kintore-kanri.app` など個人で取得したもの）を割り当て、
表示されるCNAMEをDNSに追加するだけです。ブランド感が出て、SEO流入の受け皿にもなります。

---

## 公開後の確認チェックリスト

- [ ] スマホのブラウザでURLを開き、表示が崩れていない
- [ ] iPhone: 共有 →「ホーム画面に追加」でアイコンが出る／Android: 「アプリをインストール」が出る
- [ ] ホーム画面から起動するとアドレスバーのない全画面で開く（standalone）
- [ ] 機内モードでも起動・操作できる（オフライン動作）
- [ ] 記録 → 設定 → データ管理で「バックアップを書き出す」ができる

## 更新のたびにやること

コードを変更したら `npm run build` し直して再デプロイ（CLIなら同じコマンド、Git連携なら
push するだけ）。PWAは `autoUpdate` 設定なので、ユーザーの端末は次回起動時に自動で最新化されます。
