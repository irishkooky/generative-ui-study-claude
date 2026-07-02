# Generative UI Study — 3つのアプローチで学ぶ

AI の出力を「テキスト」ではなく「UI そのもの」として返す **Generative UI** を、
同一のお題 (旅行プランナー) を 3 方式で実装して比較する学習プロジェクト。

- 参考: [AIエージェントがUIを生成する「Generative UI」を広く浅く理解したい](https://speakerdeck.com/kmiya84377/aiezientogauiwosheng-cheng-suru-generative-ui-woguang-kuqian-kuli-jie-sitai)
- スタック: [TanStack Start](https://tanstack.com/start) + [Vercel AI SDK](https://ai-sdk.dev/) (`ai` v7) + Claude (`@ai-sdk/anthropic`) + Cloudflare Workers

## 3つのアプローチ

Generative UI は「AI にどこまで UI を委ねるか」で整理できる。自由度と制御はトレードオフ。

|                 | Level 1: Static                     | Level 2: Declarative                  | Level 3: Open-Ended |
| --------------- | ----------------------------------- | ------------------------------------- | ------------------- |
| AI が決めるもの | どのコンポーネントを出すか + データ | UI の構造 (JSON)                      | HTML/CSS/JS 全部    |
| 描画するもの    | 事前定義の React コンポーネント     | 汎用レンダラ + コンポーネントカタログ | sandbox iframe      |
| 自由度          | 低                                  | 中                                    | 高                  |
| 制御・安全性    | 高                                  | 中                                    | 低                  |
| 関連する仕組み  | AI SDK の tool calling              | A2UI / MCP Apps と同系の発想          | v0 などの生成系     |

### Level 1: Static — `/static`

AI はツール呼び出しで「どの UI を出すか」を選ぶだけ。UI は開発者が書いた固定コンポーネント。

```
ツール名                クライアント側コンポーネント
getWeather        →    WeatherCard   (execute がモック天気 API を実行し、結果 output を描画)
proposeItinerary  →    ItineraryCard (AI が埋めたツール入力 input をそのまま描画)
estimateBudget    →    BudgetCard    (同上 + 合計計算)
```

実装ポイント:

- `streamText` に `tools` を渡し、クライアントは `useChat` の `message.parts` から
  `tool-getWeather` などのパートを拾って対応コンポーネントに割り当てる (`src/routes/static.tsx`)
- ツールの **input を描画する**パターン (旅程・予算) と **execute の output を描画する**パターン (天気) の両方を実装
- `input-streaming` 状態ではスケルトンを表示し、Zod で `safeParse` が通った時点でカードに切り替える

### Level 2: Declarative — `/declarative`

AI が UI 仕様 (JSON) を「宣言」し、クライアントの汎用レンダラがカタログのコンポーネントへ変換する。

- UI スキーマは Zod で定義 (`src/lib/ui-spec.ts`): `card / metrics / list / table / progress / actions` の 6 種
- `renderUI` という単一ツールの inputSchema にスキーマを渡し、AI に JSON を生成させる
- `actions` セクションのボタンは押すとユーザーメッセージとして送信され、**UI がチャットに作用する**双方向ループになる
- ストリーミング中の不完全な JSON は `parseLooseSpec` が「完成済みセクションだけ」を拾って順次描画する

### Level 3: Open-Ended — `/open-ended`

AI が完全な HTML ドキュメントを生成し、クライアントは iframe に流し込むだけ。

- ` ```html ` フェンスを正規表現で抽出し、ストリーミング中も部分 HTML を随時描画
- **安全境界は iframe の `sandbox="allow-scripts"`** (same-origin なし)。生成コードはアプリの DOM・Cookie・ストレージへアクセスできない
- 自由度は最大だが、デザインの一貫性・品質・アクセシビリティは AI 任せになることを体験できる

## アーキテクチャ

```
src/
├── routes/
│   ├── index.tsx          # 3アプローチの比較ランディング
│   ├── static.tsx         # Level 1 ページ
│   ├── declarative.tsx    # Level 2 ページ
│   ├── open-ended.tsx     # Level 3 ページ
│   └── api/chat.ts        # 共通チャット API (mode 別に system prompt / tools を切替)
├── components/
│   ├── chat-shell.tsx     # 共通チャット UI (useChat + DefaultChatTransport)
│   ├── travel-cards.tsx   # Level 1 の固定コンポーネント群
│   ├── spec-renderer.tsx  # Level 2 の汎用レンダラ
│   └── html-frame.tsx     # Level 3 の sandbox iframe
└── lib/
    ├── travel-schemas.ts  # Level 1 ツールの入出力スキーマ (server/client 共有)
    ├── travel-tools.ts    # Level 1 ツール定義 (server 専用)
    ├── ui-spec.ts         # Level 2 UI スキーマ + 寛容パーサ
    └── extract-html.ts    # Level 3 HTML フェンス抽出
```

- AI 入出力は Vercel AI SDK。サーバーは `streamText().toUIMessageStreamResponse()`、
  クライアントは `useChat` で UIMessage ストリームを購読する
- モデルは既定で `claude-opus-4-8` (`AI_MODEL` 環境変数で変更可、例: `claude-haiku-4-5`)
- API ルートは TanStack Start の server handlers (`createFileRoute` の `server.handlers.POST`)
- Cloudflare Workers 上で SSR ごと動作 (`@cloudflare/vite-plugin` + `wrangler.jsonc` の
  `main: "@tanstack/react-start/server-entry"`)

## セットアップ

```bash
vp install
cp .dev.vars.example .dev.vars   # ANTHROPIC_API_KEY を設定
vp dev
```

## デプロイ (Cloudflare Workers)

### 手動デプロイ

```bash
wrangler login
wrangler secret put ANTHROPIC_API_KEY
vp run deploy   # vp build && wrangler deploy
```

### GitHub Actions (main への push で自動デプロイ)

リポジトリの Secrets に以下を登録すると `.github/workflows/deploy.yml` が動く:

| Secret                  | 内容                                            |
| ----------------------- | ----------------------------------------------- |
| `CLOUDFLARE_API_TOKEN`  | Workers 編集権限のある API トークン             |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare アカウント ID                        |
| `ANTHROPIC_API_KEY`     | Claude API キー (Worker シークレットとして同期) |

## 学んだことメモ

- **自由度と制御はトレードオフ**。プロダクションでは Static / Declarative が現実解になりやすく、
  Open-Ended は sandbox 前提のプロトタイピング・パーソナライズ用途に向く
- ツール呼び出しの `input` は**ストリーミング中に部分 JSON として届く**ので、
  「パースできた分だけ描画する」設計にすると Generative UI らしい体験になる
- Declarative のスキーマ設計がそのままプロダクトの表現力の上限になる。
  `actions` のような「UI からチャットへ返すセクション」を入れると一気にアプリらしくなる
- Open-Ended の安全性は `iframe sandbox` が生命線。`allow-same-origin` を付けたら境界が消える
- Vercel AI SDK の UIMessage ストリームはこの 3 方式すべてを同じ `useChat` で扱える

## Everyday commands

| Command         | Purpose                                               |
| --------------- | ----------------------------------------------------- |
| `vp dev`        | 開発サーバー (workerd 上で SSR)                       |
| `vp build`      | 本番ビルド (`dist/` に client + server/wrangler.json) |
| `vp check`      | フォーマット + Lint + 型チェック                      |
| `vp test`       | テスト (`src/**/*.test.ts`)                           |
| `vp run deploy` | ビルドして Cloudflare Workers へデプロイ              |

## License

[MIT](LICENSE.md).
