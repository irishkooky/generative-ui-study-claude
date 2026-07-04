import { createAnthropic } from "@ai-sdk/anthropic";
import { openuiChatLibrary, openuiChatPromptOptions } from "@openuidev/react-ui/genui-lib";
import { createFileRoute } from "@tanstack/react-router";
import type { ToolSet, UIMessage } from "ai";
import { convertToModelMessages, stepCountIs, streamText, tool } from "ai";

import { travelTools } from "../../lib/travel-tools";
import { uiSpecSchema } from "../../lib/ui-spec";

export type ChatMode = "static" | "declarative" | "open-ended" | "openui";

const BASE_SYSTEM = `あなたは旅行プランナー「Travel Genie」。日本語で簡潔に答える。
ユーザーの要望が曖昧なときも、まず妥当な仮定を置いて提案し、末尾で確認する。`;

const OPEN_ENDED_BASE = `回答は必ず1つの \`\`\`html コードフェンスに完結した HTML ドキュメントとして出力する。
- <style> はインラインで含める。外部リソース (CDN, 画像 URL, Web フォント) は使わない
- JavaScript を使う場合は <script> をインラインで含める (iframe sandbox 内で実行される)
- 配色・レイアウトは内容に合わせて自由にデザインしてよい
- HTML の前後に置くテキストは1〜2文の説明のみ`;

const MODE_CONFIG: Record<ChatMode, { system: string; tools: ToolSet }> = {
  // レベル1: AI は「どの固定コンポーネントを出すか」を選ぶだけ。
  // UI の見た目はすべてクライアント側の React コンポーネントが決める。
  static: {
    system: `${BASE_SYSTEM}
天気・旅程・予算の情報は必ず対応するツールで提示する (テキストで代替しない)。
ツールの結果 UI がユーザーに見えているので、同じ内容をテキストで繰り返さないこと。
補足コメントは1〜2文にとどめる。`,
    tools: travelTools,
  },
  // レベル2: AI が UI の「構造」を JSON で宣言し、クライアントの
  // 汎用レンダラがコンポーネントカタログに変換して描画する。
  declarative: {
    system: `${BASE_SYSTEM}
回答の本体は必ず renderUI ツールで UI として提示する。
情報の性質に合わせてセクション種別 (card / metrics / list / table / progress / actions) を選ぶ。
actions セクションには、ユーザーが次に取りそうなアクションを2〜4個入れる。
テキストでの補足は1文まで。`,
    tools: {
      renderUI: tool({
        description:
          "UI 仕様 (JSON) を宣言してユーザー画面に描画する。回答の情報はこのツールに全て入れること。",
        inputSchema: uiSpecSchema,
        execute: () => ({ status: "rendered" as const }),
      }),
    },
  },
  // レベル3: AI が HTML を直接生成し、クライアントは sandbox 化した
  // iframe に流し込むだけ。自由度は最大だが制御は最小。
  "open-ended": {
    system: `${BASE_SYSTEM}
${OPEN_ENDED_BASE}`,
    tools: {},
  },
  // レベル3': OpenUI (openui.com)。AI は HTML ではなくコンパクトな OpenUI Lang を
  // 出力し、クライアントは公式 Renderer が React コンポーネントとして描画する。
  // system prompt はコンポーネント仕様ごとライブラリから生成する。
  openui: {
    system: openuiChatLibrary.prompt({
      ...openuiChatPromptOptions,
      preamble: BASE_SYSTEM,
    }),
    tools: {},
  },
};

function isChatMode(value: unknown): value is ChatMode {
  return (
    value === "static" || value === "declarative" || value === "open-ended" || value === "openui"
  );
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as {
          messages: UIMessage[];
          mode?: unknown;
        };
        const mode = isChatMode(body.mode) ? body.mode : "static";
        const config = MODE_CONFIG[mode];

        const apiKey = process.env["ANTHROPIC_API_KEY"];
        if (!apiKey) {
          return Response.json(
            { error: "ANTHROPIC_API_KEY が設定されていません" },
            { status: 500 },
          );
        }
        const anthropic = createAnthropic({ apiKey });

        const result = streamText({
          model: anthropic(process.env["AI_MODEL"] ?? "claude-opus-4-8"),
          system: config.system,
          messages: await convertToModelMessages(body.messages),
          tools: config.tools,
          stopWhen: stepCountIs(8),
        });

        return result.toUIMessageStreamResponse();
      },
    },
  },
});
