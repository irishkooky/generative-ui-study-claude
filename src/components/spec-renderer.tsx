import { cn } from "cnfast";

import type { UISection } from "../lib/ui-spec";
import { parseLooseSpec } from "../lib/ui-spec";

/**
 * Declarative アプローチの本体: AI が宣言した UI 仕様 (JSON) を
 * コンポーネントカタログに割り当てて描画する汎用レンダラ。
 * ストリーミング中の不完全な JSON でも、完成済みセクションから順に描画される。
 */

const CARD_TONE: Record<string, string> = {
  default: "border-slate-200 bg-white",
  info: "border-sky-200 bg-sky-50",
  success: "border-emerald-200 bg-emerald-50",
  warning: "border-amber-200 bg-amber-50",
};

function Section({
  section,
  onAction,
}: {
  section: UISection;
  onAction: (message: string) => void;
}) {
  switch (section.type) {
    case "card":
      return (
        <div className={cn("rounded-xl border p-4", CARD_TONE[section.tone ?? "default"])}>
          <p className="text-sm font-semibold text-slate-900">{section.title}</p>
          <p className="mt-1 text-sm whitespace-pre-wrap text-slate-600">{section.body}</p>
        </div>
      );
    case "metrics":
      return (
        <div>
          {section.title ? <SectionTitle text={section.title} /> : null}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {section.items.map((item) => (
              <div key={item.label} className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-xs text-slate-500">{item.label}</p>
                <p className="mt-0.5 text-lg font-bold text-slate-900">{item.value}</p>
                {item.hint ? <p className="text-xs text-slate-400">{item.hint}</p> : null}
              </div>
            ))}
          </div>
        </div>
      );
    case "list": {
      const Tag = section.ordered ? "ol" : "ul";
      return (
        <div>
          {section.title ? <SectionTitle text={section.title} /> : null}
          <Tag className="space-y-2">
            {section.items.map((item, index) => (
              <li
                key={item.title}
                className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3"
              >
                {section.ordered ? (
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                    {index + 1}
                  </span>
                ) : (
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-indigo-400" />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800">
                    {item.title}
                    {item.badge ? (
                      <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                        {item.badge}
                      </span>
                    ) : null}
                  </p>
                  {item.description ? (
                    <p className="text-xs text-slate-500">{item.description}</p>
                  ) : null}
                </div>
              </li>
            ))}
          </Tag>
        </div>
      );
    }
    case "table":
      return (
        <div>
          {section.title ? <SectionTitle text={section.title} /> : null}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full bg-white text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left">
                  {section.columns.map((column) => (
                    <th key={column} className="px-3 py-2 text-xs font-semibold text-slate-600">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {section.rows.map((row, rowIndex) => (
                  // 行に安定 ID がなく追記のみのため index キーを許容する
                  // oxlint-disable-next-line react-doctor/no-array-index-as-key
                  <tr key={rowIndex} className="border-b border-slate-100 last:border-0">
                    {row.map((cell, cellIndex) => (
                      // oxlint-disable-next-line react-doctor/no-array-index-as-key
                      <td key={cellIndex} className="px-3 py-2 text-slate-700">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    case "progress":
      return (
        <div>
          {section.title ? <SectionTitle text={section.title} /> : null}
          <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-3">
            {section.items.map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-xs text-slate-600">
                  <span>{item.label}</span>
                  <span>{item.caption ?? `${String(Math.round(item.percent))}%`}</span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-slate-100">
                  <div
                    className="h-1.5 rounded-full bg-indigo-500"
                    style={{ width: `${String(Math.min(100, Math.max(0, item.percent)))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    case "actions":
      return (
        <div>
          {section.title ? <SectionTitle text={section.title} /> : null}
          <div className="flex flex-wrap gap-2">
            {section.items.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => onAction(item.message)}
                className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm text-indigo-700 transition hover:bg-indigo-100"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      );
  }
}

function SectionTitle({ text }: { text: string }) {
  return <p className="mb-2 text-xs font-semibold tracking-wide text-slate-500">{text}</p>;
}

export function SpecRenderer({
  input,
  streaming,
  onAction,
}: {
  input: unknown;
  streaming: boolean;
  onAction: (message: string) => void;
}) {
  const spec = parseLooseSpec(input);
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 shadow-sm">
      {spec.title ? <p className="text-base font-bold text-slate-900">{spec.title}</p> : null}
      {spec.description ? <p className="mt-1 text-sm text-slate-500">{spec.description}</p> : null}
      <div className="mt-3 space-y-4">
        {spec.sections.map((section, index) => (
          // ストリーミング追記のみのリストなので index キーを許容する
          // oxlint-disable-next-line react-doctor/no-array-index-as-key
          <Section key={index} section={section} onAction={onAction} />
        ))}
      </div>
      {streaming ? (
        <p className="mt-3 animate-pulse text-xs text-slate-400">UI を生成中...</p>
      ) : null}
    </div>
  );
}
