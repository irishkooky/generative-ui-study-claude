import "@openuidev/react-ui/components.css";
import { Renderer } from "@openuidev/react-lang";
import { ThemeProvider } from "@openuidev/react-ui";
import { openuiChatLibrary } from "@openuidev/react-ui/genui-lib";
import { createFileRoute } from "@tanstack/react-router";
import { cn } from "cnfast";
import { useState } from "react";

import { ChatShell } from "../components/chat-shell";
import { HtmlFrame } from "../components/html-frame";
import { extractHtml } from "../lib/extract-html";

export const Route = createFileRoute("/open-ended")({
  component: OpenEndedPage,
});

function OpenEndedPage() {
  const [openUi, setOpenUi] = useState(false);
  const mode = openUi ? ("openui" as const) : ("open-ended" as const);

  // React Compiler がキャッシュするため手動メモ化は不要 (変数化は jsx-no-jsx-as-prop 対策)
  const headerExtra = (
    <div className="mt-2 flex items-center gap-2">
      <button
        type="button"
        role="switch"
        aria-checked={openUi}
        onClick={() => setOpenUi((value) => !value)}
        className={cn(
          "rounded-full border px-3 py-1 text-xs font-medium transition",
          openUi
            ? "border-indigo-400 bg-indigo-50 text-indigo-700"
            : "border-slate-300 bg-white text-slate-500 hover:text-slate-700",
        )}
      >
        OpenUI モード: {openUi ? "ON" : "OFF"}
      </button>
      <span className="text-xs text-slate-400">
        {openUi
          ? "AI が OpenUI Lang を出力し、公式 Renderer が React コンポーネントとして描画する (切替でチャットはリセット)"
          : "ON にすると、生 HTML の代わりに OpenUI (openui.com) の DSL + Renderer で UI を生成する"}
      </span>
    </div>
  );

  return (
    // トグル切替でチャットを仕切り直し、同じお題で生成結果を比較しやすくする
    <ChatShell
      key={mode}
      mode={mode}
      title="Level 3: Open-Ended"
      tagline="AI が HTML を直接生成し、sandbox 化した iframe に描画する。自由度は最大、制御は最小。"
      // React Compiler が headerExtra をキャッシュするため再描画コストはない
      // oxlint-disable-next-line react-doctor/jsx-no-jsx-as-prop
      headerExtra={headerExtra}
      suggestions={[
        "沖縄3泊4日の旅のしおりページを作って",
        "ヨーロッパ周遊ルートを紹介するランディングページ風に",
        "旅程の各日をタップで開閉でき、注意事項をポップオーバーで出せるしおりを作って",
      ]}
      renderPart={() => null}
      renderTextPart={(text, streaming, { send }) => {
        if (openUi) {
          // OpenUI モード: 応答全体が OpenUI Lang コードなので Renderer に渡す。
          // アクション (フォローアップ等) はそのままチャット送信につなぐ
          return (
            <ThemeProvider mode="light">
              <Renderer
                response={text}
                library={openuiChatLibrary}
                isStreaming={streaming}
                onAction={(event) => {
                  send(event.humanFriendlyMessage);
                }}
              />
            </ThemeProvider>
          );
        }
        const { html, prose } = extractHtml(text);
        return (
          <div className="space-y-3">
            {prose.trim() !== "" ? (
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-slate-700">{prose}</p>
            ) : null}
            {html != null ? <HtmlFrame html={html} streaming={streaming} /> : null}
          </div>
        );
      }}
    />
  );
}
