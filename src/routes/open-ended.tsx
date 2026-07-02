import { createFileRoute } from "@tanstack/react-router";

import { ChatShell } from "../components/chat-shell";
import { HtmlFrame } from "../components/html-frame";
import { extractHtml } from "../lib/extract-html";

export const Route = createFileRoute("/open-ended")({
  component: OpenEndedPage,
});

function OpenEndedPage() {
  return (
    <ChatShell
      mode="open-ended"
      title="Level 3: Open-Ended"
      tagline="AI が HTML を直接生成し、sandbox 化した iframe に描画する。自由度は最大、制御は最小。"
      suggestions={[
        "沖縄3泊4日の旅のしおりページを作って",
        "ヨーロッパ周遊ルートを紹介するランディングページ風に",
        "旅行の予算配分を計算できるインタラクティブなツールを作って",
      ]}
      renderPart={() => null}
      renderTextPart={(text, streaming) => {
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
