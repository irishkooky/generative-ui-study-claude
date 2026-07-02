# ハンドオフ: デプロイ作業

このドキュメントは、リモート環境 (Cloudflare 認証情報なし) で実装した
Generative UI 学習アプリを、ローカル環境からデプロイするための引き継ぎメモ。
完了したらこのファイルは削除して問題ない。

## 現在の状態

- ブランチ: `claude/generative-ui-project-pgjeke` (リモート `origin` に push 済み)
- コミット: `40848f9` 1本 (26ファイル追加/変更)
- `main` へは未マージ (PR も未作成)
- リモート環境で `vp check` / `vp test` / `vp build` / dev サーバーでの表示確認まで完了済み
- Cloudflare へのデプロイは未実施 (このリポジトリの認証情報がリモート環境になかったため)

```bash
git fetch origin
git checkout claude/generative-ui-project-pgjeke
# または: git checkout -b claude/generative-ui-project-pgjeke origin/claude/generative-ui-project-pgjeke
```

## 何を作ったか (1分で把握)

「Travel Genie」という旅行プランナーを Generative UI の3方式 (Static /
Declarative / Open-Ended) で実装した学習アプリ。詳細は [README.md](README.md)
を参照。技術構成:

- TanStack Start (React 19, ファイルベースルーティング)
- Vercel AI SDK v7 (`ai`, `@ai-sdk/react`, `@ai-sdk/anthropic`) — Claude 呼び出し
- Cloudflare Workers (`@cloudflare/vite-plugin` + `wrangler.jsonc`)

## やってほしいこと

### 1. Node.js バージョンの確認

`.node-version` は `24.17.0`。ローカルに無ければ `nvm install 24.17.0` などで用意する。
`vp` (Vite+) が Node 22 以下でも一応動くことはあるが、`engines` 制約があるので合わせておくと安全。

### 2. 依存インストールとローカル最終確認 (念のため)

```bash
vp install
vp check   # lint + format + 型チェック。0 errors / 0 warnings のはず
vp test    # 7 tests, 3 files, 全部 pass のはず
vp build   # dist/client と dist/server (wrangler.json 含む) が生成される
```

ここで何か落ちていたら、リモート環境と Node バージョンやロックファイルの
差分が原因の可能性が高い。`pnpm-lock.yaml` は commit 済みなのでそのまま使う。

### 3. Cloudflare へのデプロイ

#### 3-a. Wrangler ログイン

```bash
npx wrangler login
```

ブラウザが開いて Cloudflare アカウントの認証を求められる。

#### 3-b. シークレット登録 (Worker 名は `wrangler.jsonc` の `name: "generative-ui-study"`)

```bash
npx wrangler secret put ANTHROPIC_API_KEY
# プロンプトで Anthropic の API キーを入力 (sk-ant-... )
```

必要なら `AI_MODEL` も設定できる (未設定時は `claude-opus-4-8` を使用):

```bash
npx wrangler secret put AI_MODEL
# 例: claude-haiku-4-5 (コストを抑えたい場合)
```

#### 3-c. デプロイ

```bash
vp run deploy
# 中身は: vp build && wrangler deploy
```

成功すると `https://generative-ui-study.<あなたのサブドメイン>.workers.dev`
のような URL が出力される。そこにアクセスして `/`, `/static`, `/declarative`,
`/open-ended` の4ページと実際のチャット動作 (本物の API キーでの応答) を確認する。

**確認ポイント:**
- `/static`: 「来月の3連休に京都へ2泊3日で行きたい」等を送って天気・旅程・予算カードが出るか
- `/declarative`: 「北海道旅行の計画をダッシュボードにまとめて」等を送って JSON UI が描画されるか。
  actions セクションのボタンを押すとチャットに新しいメッセージが送られるか
- `/open-ended`: 「沖縄の旅のしおりページを作って」等を送って iframe 内に HTML が描画されるか
  (ブラウザの DevTools で iframe に `sandbox="allow-scripts"` が付いていることも確認すると安心)

### 4. main へのマージ (お好みで)

ローカルでの動作確認後、必要であれば PR を作成してマージする。

```bash
git push origin claude/generative-ui-project-pgjeke  # 未 push の変更があれば
gh pr create --title "Generative UI 学習アプリを追加" --base main \
  --body "3方式 (Static/Declarative/Open-Ended) の Generative UI 実装。詳細は README.md 参照。"
```

マージ後、CI (`.github/workflows/deploy.yml`) を使った自動デプロイに切り替えるなら、
GitHub リポジトリの Settings → Secrets and variables → Actions に以下を登録する:

| Secret | 内容 |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Workers 編集権限のある API トークン (Cloudflare ダッシュボードで発行) |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare アカウント ID |
| `ANTHROPIC_API_KEY` | Claude API キー (Worker シークレットとして同期される) |

これで `main` に push するたびに自動ビルド・自動デプロイされる。

## つまずきそうなポイント

- **`wrangler.jsonc` の `main` フィールド**: `"@tanstack/react-start/server-entry"` という
  パッケージのサブパスを指している (通常の JS ファイルパスではない)。これは
  `@cloudflare/vite-plugin` + TanStack Start の組み合わせで正しい書き方なので、
  エラーが出ても変更しないこと。ビルド後の `dist/server/wrangler.json` に
  実体のパスへ解決された状態が出力される。
- **`.dev.vars` はローカル開発専用**、Cloudflare 上の本番シークレットとは別物。
  ローカルで `vp dev` する場合は `.dev.vars.example` をコピーして
  `ANTHROPIC_API_KEY` を設定する (すでに `.gitignore` 対象)。
- **`vite.config.ts` に `isTest` 分岐がある**: `@cloudflare/vite-plugin` は
  vitest のサーバー環境 (`resolve.external`) と競合するため、`VITEST=true` の
  ときだけ Cloudflare プラグインを外している。通常のビルド/デプロイでは
  何もしなくてよい (この分岐は `vp test` 用)。
- **料金**: `claude-opus-4-8` は高品質だがコストが高め。デモ・検証中心なら
  `AI_MODEL=claude-haiku-4-5` に切り替えるのも手 (上記 3-b 参照)。
