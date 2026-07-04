import { useState } from "react";

/**
 * Open-Ended アプローチの本体: AI が生成した HTML をそのまま描画する。
 * sandbox 属性 (allow-scripts のみ・same-origin なし) が安全境界。
 * 生成 HTML はアプリの DOM・Cookie・ストレージへ一切アクセスできない。
 */

export function HtmlFrame({ html, streaming }: { html: string; streaming: boolean }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-1.5">
        <p className="text-xs text-slate-500">
          {streaming ? "🔄 HTML を生成中..." : "🧪 生成された HTML (sandbox iframe)"}
        </p>
        <button
          type="button"
          onClick={() => setExpanded((previous) => !previous)}
          className="text-xs text-indigo-600 hover:underline"
        >
          {expanded ? "縮小" : "拡大"}
        </button>
      </div>
      <iframe
        title="AI が生成した UI"
        sandbox="allow-scripts"
        srcDoc={html}
        className={expanded ? "h-[80vh] w-full bg-white" : "h-96 w-full bg-white"}
      />
    </div>
  );
}
