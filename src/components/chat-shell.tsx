import { useChat } from "@ai-sdk/react";
import { Link } from "@tanstack/react-router";
import { DefaultChatTransport } from "ai";
import type { UIMessage } from "ai";
import { cn } from "cnfast";
import type { ReactNode } from "react";
import { useState } from "react";

export interface PartRenderContext {
  send: (text: string) => void;
  isLast: boolean;
}

interface ChatShellProps {
  mode: "static" | "declarative" | "open-ended" | "openui";
  title: string;
  tagline: string;
  suggestions: string[];
  /** header の tagline 下に差し込む任意 UI (モード切替トグルなど)。 */
  headerExtra?: ReactNode;
  /** text 以外のメッセージパートの描画。null を返すとそのパートは非表示。 */
  renderPart: (part: UIMessage["parts"][number], context: PartRenderContext) => ReactNode;
  /** アシスタントの text パートの描画を差し替える (省略時はプレーンテキスト)。 */
  renderTextPart?: (text: string, streaming: boolean, context: PartRenderContext) => ReactNode;
}

const MODES = [
  { to: "/static", label: "Static", mode: "static" },
  { to: "/declarative", label: "Declarative", mode: "declarative" },
  { to: "/open-ended", label: "Open-Ended", mode: "open-ended" },
] as const;

function collectText(message: UIMessage): string {
  let text = "";
  for (const part of message.parts) {
    if (part.type === "text") {
      text += part.text;
    }
  }
  return text;
}

export function ChatShell({
  mode,
  title,
  tagline,
  suggestions,
  headerExtra,
  renderPart,
  renderTextPart,
}: ChatShellProps) {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat", body: { mode } }),
  });

  const busy = status === "submitted" || status === "streaming";

  const send = (text: string) => {
    const trimmed = text.trim();
    if (trimmed === "" || busy) return;
    void sendMessage({ text: trimmed });
    setInput("");
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4">
      <header className="sticky top-0 z-10 -mx-4 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <Link to="/" className="text-xs font-medium text-slate-400 hover:text-slate-600">
              ← Generative UI Study
            </Link>
            <h1 className="truncate text-lg font-bold text-slate-900">{title}</h1>
          </div>
          <nav className="flex shrink-0 gap-1 rounded-full bg-slate-100 p-1">
            {MODES.map((entry) => (
              <Link
                key={entry.to}
                to={entry.to}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium text-slate-500 hover:text-slate-800",
                  // openui モードは /open-ended ページのトグルなので Open-Ended タブを点灯する
                  (mode === entry.mode || (entry.mode === "open-ended" && mode === "openui")) &&
                    "bg-white text-slate-900 shadow-sm",
                )}
              >
                {entry.label}
              </Link>
            ))}
          </nav>
        </div>
        <p className="mt-1 text-xs text-slate-500">{tagline}</p>
        {headerExtra}
      </header>

      <main className="flex-1 space-y-6 py-6">
        {messages.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-6">
            <p className="text-sm font-medium text-slate-600">試してみる:</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => send(suggestion)}
                  className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-left text-sm text-slate-700 transition hover:border-indigo-400 hover:text-indigo-700"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {messages.map((message, messageIndex) => {
          const isLast = messageIndex === messages.length - 1;
          if (message.role === "user") {
            return (
              <div key={message.id} className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-br-md bg-indigo-600 px-4 py-2.5 text-sm whitespace-pre-wrap text-white">
                  {collectText(message)}
                </div>
              </div>
            );
          }
          return (
            <div key={message.id} className="space-y-3">
              {message.parts.map((part, partIndex) => {
                if (part.type === "text") {
                  if (part.text.trim() === "") return null;
                  if (renderTextPart) {
                    const renderedText = renderTextPart(part.text, part.state === "streaming", {
                      send,
                      isLast,
                    });
                    return <div key={`${message.id}-${partIndex}`}>{renderedText}</div>;
                  }
                  return (
                    <p
                      key={`${message.id}-${partIndex}`}
                      className="text-sm leading-relaxed whitespace-pre-wrap text-slate-700"
                    >
                      {part.text}
                    </p>
                  );
                }
                const rendered = renderPart(part, { send, isLast });
                if (rendered == null) return null;
                return <div key={`${message.id}-${partIndex}`}>{rendered}</div>;
              })}
            </div>
          );
        })}

        {status === "submitted" ? (
          <p className="animate-pulse text-sm text-slate-400">考え中...</p>
        ) : null}
        {status === "error" ? (
          <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700">
            エラーが発生しました。ANTHROPIC_API_KEY の設定を確認してから再試行してください。
          </p>
        ) : null}
      </main>

      <footer className="sticky bottom-0 -mx-4 border-t border-slate-200 bg-white px-4 py-3">
        <form
          action={() => {
            send(input);
          }}
          className="flex gap-2"
        >
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="旅行の相談をどうぞ (例: 3月に金沢へ1泊2日)"
            aria-label="メッセージ入力"
            className="flex-1 rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={busy || input.trim() === ""}
            className="rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition disabled:opacity-40"
          >
            送信
          </button>
        </form>
      </footer>
    </div>
  );
}
