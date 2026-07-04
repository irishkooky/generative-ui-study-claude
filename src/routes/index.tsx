import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
});

const APPROACHES = [
  {
    to: "/static",
    level: "Level 1",
    name: "Static",
    headline: "AI が事前定義コンポーネントを選ぶ",
    description:
      "AI はツール呼び出しで「どの UI を出すか」と「データ」だけを決める。見た目は開発者が書いた React コンポーネントが完全に制御する。",
    mechanism: "tool calling → 固定 React コンポーネント",
    pros: "デザイン・アクセシビリティ・安全性を完全に制御できる",
    cons: "用意したコンポーネントの範囲でしか表現できない",
    accent: "border-emerald-300 bg-emerald-50 text-emerald-700",
  },
  {
    to: "/declarative",
    level: "Level 2",
    name: "Declarative",
    headline: "AI が UI の構造を JSON で宣言する",
    description:
      "AI はスキーマに従った UI 仕様 (JSON) を出力し、クライアントの汎用レンダラがコンポーネントカタログへ変換して描画する。A2UI や MCP Apps と同じ発想。",
    mechanism: "UI スキーマ (JSON) → 汎用レンダラ",
    pros: "柔軟性と制御のバランスが良い。レイアウトを AI が組める",
    cons: "スキーマ設計が必要。カタログ外の表現はできない",
    accent: "border-indigo-300 bg-indigo-50 text-indigo-700",
  },
  {
    to: "/open-ended",
    level: "Level 3",
    name: "Open-Ended",
    headline: "AI が HTML/CSS/JS を直接生成する",
    description:
      "AI が完全な HTML ドキュメントを生成し、sandbox 化した iframe に流し込む。表現は自由だが、品質・一貫性・安全性の制御は最も難しい。OpenUI (openui.com) の DSL + Renderer で描画する「OpenUI モード」トグル付き。",
    mechanism: "生成 HTML → sandbox iframe",
    pros: "表現の自由度が最大。想定外の要望にも UI で応えられる",
    cons: "デザインの一貫性・品質・安全性の担保が難しい",
    accent: "border-rose-300 bg-rose-50 text-rose-700",
  },
] as const;

function Home() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-xs font-semibold tracking-widest text-indigo-600 uppercase">
        Generative UI Study
      </p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">
        AI が UI を生成する 3 つのアプローチを、
        <br />
        同じ旅行プランナーで比べる
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-slate-600">
        Generative UI とは、AI の出力をテキストではなく「UI そのもの」として返す考え方。
        このアプリでは同一のお題 (旅行プランニング) を Static / Declarative / Open-Ended の 3
        方式で実装し、自由度と制御のトレードオフを体験できる。実装は TanStack Start + Vercel AI SDK
        + Claude、動作環境は Cloudflare Workers。
      </p>

      <div className="mt-10 space-y-4">
        {APPROACHES.map((approach) => (
          <Link
            key={approach.to}
            to={approach.to}
            className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <span
                className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${approach.accent}`}
              >
                {approach.level}
              </span>
              <span className="text-lg font-bold text-slate-900">{approach.name}</span>
              <span className="ml-auto text-slate-300">→</span>
            </div>
            <p className="mt-2 text-sm font-medium text-slate-800">{approach.headline}</p>
            <p className="mt-1 text-sm leading-relaxed text-slate-500">{approach.description}</p>
            <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-3">
              <div className="rounded-lg bg-slate-50 p-2">
                <dt className="font-semibold text-slate-500">仕組み</dt>
                <dd className="mt-0.5 text-slate-600">{approach.mechanism}</dd>
              </div>
              <div className="rounded-lg bg-slate-50 p-2">
                <dt className="font-semibold text-slate-500">強み</dt>
                <dd className="mt-0.5 text-slate-600">{approach.pros}</dd>
              </div>
              <div className="rounded-lg bg-slate-50 p-2">
                <dt className="font-semibold text-slate-500">弱み</dt>
                <dd className="mt-0.5 text-slate-600">{approach.cons}</dd>
              </div>
            </dl>
          </Link>
        ))}
      </div>

      <Link
        to="/open-ui"
        className="mt-6 block rounded-2xl border border-dashed border-slate-300 bg-white p-5 transition hover:-translate-y-0.5 hover:border-amber-400 hover:shadow-md"
      >
        <div className="flex items-center gap-3">
          <span className="rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
            番外編
          </span>
          <span className="text-lg font-bold text-slate-900">ブラウザ標準 UI 比較</span>
          <span className="ml-auto text-slate-300">→</span>
        </div>
        <p className="mt-2 text-sm font-medium text-slate-800">
          自前実装 vs ブラウザ標準 (popover / dialog / details)
        </p>
        <p className="mt-1 text-sm leading-relaxed text-slate-500">
          W3C Open UI コミュニティグループ発のネイティブ機能を使った場合と使わない場合で、同じ UI
          の実装がどう変わるかを並べて比較する (openui.com の OpenUI フレームワークとは別物)。
        </p>
      </Link>

      <footer className="mt-12 border-t border-slate-200 pt-4 text-xs text-slate-400">
        学習用プロジェクト。各モードの実装は README の学習メモを参照。
      </footer>
    </main>
  );
}
