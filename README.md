# Chiri ✦ 地理クイズ

> 中学地理を楽しく学ぶ PWA クイズアプリ — 帝国書院準拠 · 750問収録

![PWA](https://img.shields.io/badge/PWA-対応-blueviolet)
![License](https://img.shields.io/badge/license-MIT-pink)

---

## ✨ 特徴

- **750問収録** — 帝国書院「社会科 中学生の地理」準拠、全25単元 × EASY/NORMAL/HARD 各10問
- **Notion連携** — Notion DB から問題を追加・削除・編集できる（GitHub Actions で毎日自動同期）
- **完全オフライン対応** — Service Worker によるキャッシュで通信なしでもプレイ可能
- **PWA** — iOS Safari のホーム画面に追加してネイティブ風に動作

---

## 📁 ファイル構成

```
chiri/
├── index.html              # アプリ本体（単一ファイル）
├── manifest.json           # PWA マニフェスト
├── sw.js                   # Service Worker
├── icons/
│   ├── icon.svg            # マスターアイコン（SVG）
│   ├── icon-512.png        # App Store / PWA 用
│   ├── icon-192.png        # ホーム画面用
│   ├── apple-touch-icon.png # iOS 用
│   └── favicon-32.png      # ブラウザタブ用
├── scripts/
│   └── fetch-notion.js     # Notion → api/questions.json 変換スクリプト
└── .github/
    └── workflows/
        └── deploy.yml      # GitHub Actions（Notion同期 → Pages自動デプロイ）
```

---

## 🚀 GitHub Pages へのデプロイ手順

### 1. リポジトリ作成 & プッシュ

```bash
git init
git add .
git commit -m "🎉 Initial commit"
git remote add origin https://github.com/YOUR_NAME/chiri.git
git push -u origin main
```

### 2. GitHub Secrets を設定

`Settings > Secrets and variables > Actions > New repository secret` で以下を登録：

| Secret 名 | 値 |
|-----------|-----|
| `NOTION_TOKEN` | Notion Integration の Internal Integration Token |
| `NOTION_DB_ID` | 問題バンク DB の ID（URLの末尾32文字） |

### 3. GitHub Pages を有効化

`Settings > Pages > Source` で **GitHub Actions** を選択。

### 4. 動作確認

Actions タブから `workflow_dispatch` で手動実行 → `https://YOUR_NAME.github.io/chiri/` でアクセス。

---

## 📝 Notion から問題を追加・削除する方法

### 問題の追加

1. Notion の「地理クイズ 問題バンク」DB を開く
2. 新しいレコードを追加し、以下のカラムを入力：

| カラム名 | 内容 | 例 |
|---------|------|-----|
| 問題文 | 問題の文章 | 「日本最高峰の山は？」 |
| 単元コード | 対応単元のコード | `2-B-01` |
| 単元名 | 単元の名前 | `日本の地形` |
| 難易度 | 基礎 / 標準 / 応用 | `基礎` |
| 選択肢A〜D | 4択の選択肢 | `富士山` |
| 正解 | A / B / C / D | `A` |
| 解説 | 解説文 | 「富士山は3776mで...」 |
| 確認済み | ✅チェックをON | ✅ |

3. **「確認済み」チェックを ON** にすると次の同期で自動反映

### 問題の削除

- Notion でレコードを削除するか、「確認済み」チェックを OFF にする
- 次の同期（毎日 AM3時 JST）で反映、または手動で Actions を実行

### 即時反映したい場合

`Actions > Notion同期 & GitHub Pages デプロイ > Run workflow` で手動実行（数分で反映）

---

## 🔧 Notion DB のカラム設定

| カラム名 | 型 |
|---------|-----|
| 問題文 | タイトル |
| 学年 | セレクト（中1 / 中2 / 中3） |
| 単元コード | テキスト |
| 単元名 | テキスト |
| 難易度 | セレクト（基礎 / 標準 / 応用） |
| 選択肢A | テキスト |
| 選択肢B | テキスト |
| 選択肢C | テキスト |
| 選択肢D | テキスト |
| 正解 | セレクト（A / B / C / D） |
| 解説 | テキスト |
| 確認済み | チェックボックス |

---

## 📱 iOS アプリ化（Capacitor）

```bash
npm install @capacitor/core @capacitor/cli @capacitor/ios
npx cap init "Chiri地理クイズ" com.yourname.chiri --web-dir .
npx cap add ios
npx cap sync
npx cap open ios   # Xcode が開く
```

詳細なロードマップは Notion の「Chiri iOSリリース & 収益化ロードマップ」を参照。

---

## 📜 ライセンス

MIT License — 個人・教育目的での利用自由
