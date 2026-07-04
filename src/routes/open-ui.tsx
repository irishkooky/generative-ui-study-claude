import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/open-ui")({
  component: OpenUIPage,
});

const FAQ_ITEMS = [
  {
    id: "faq-1",
    question: "キャンセル料はいつから発生しますか?",
    answer: "出発日の14日前から50%、7日前から100%のキャンセル料が発生します。",
  },
  {
    id: "faq-2",
    question: "グループ割引はありますか?",
    answer: "6名以上の団体予約で10%割引、10名以上で15%割引があります。",
  },
  {
    id: "faq-3",
    question: "ペットの同伴は可能ですか?",
    answer: "ペット同伴可能な宿泊施設もございます。予約時にご相談ください。",
  },
] as const;

function OpenUIPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          ← Generative UI Study
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-slate-900">
          Open UI 比較: 自前実装 vs ネイティブ
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Open UI は W3C コミュニティグループで推進されるイニシアティブで、popover 属性、Invoker
          Commands (command/commandfor)、&lt;dialog&gt;、&lt;details&gt;
          などの機能をブラウザ標準にしています。従来の React
          自前実装との違いを同一ページで比較できます。
        </p>
      </div>

      {/* Section 1: Popover */}
      <section className="mb-12">
        <h2 className="mb-6 text-2xl font-bold text-slate-900">
          セクション 1: ポップオーバー (旅程の補足情報)
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Traditional */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-slate-900">従来: React 自前実装</h3>
            <TraditionalPopover />
            <div className="mt-4 border-t border-slate-100 pt-4">
              <p className="text-xs font-medium text-slate-500 uppercase">解説</p>
              <p className="mt-1 text-xs text-slate-600">
                useState でトグル状態を管理。position: absolute
                で位置決め。外側クリックで閉じる処理は通常は onClick や useEffect(useOnClickOutside
                パターン)が必要ですが、ここでは簡略化のため実装なし。
              </p>
            </div>
          </div>

          {/* Open UI */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-slate-900">Open UI: ネイティブ</h3>
            <OpenUIPopover />
            <div className="mt-4 border-t border-slate-100 pt-4">
              <p className="text-xs font-medium text-slate-500 uppercase">解説</p>
              <p className="mt-1 text-xs text-slate-600">
                JavaScript ゼロ。popover=&quot;auto&quot; と Invoker Commands (commandfor +
                command=&quot;toggle-popover&quot;) により、light-dismiss(外側クリック)と Esc
                が自動で有効。旧 popovertarget 属性は commandfor
                に置き換えられ、将来的に非推奨予定。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Dialog */}
      <section className="mb-12">
        <h2 className="mb-6 text-2xl font-bold text-slate-900">
          セクション 2: モーダルダイアログ (予約の確認)
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Traditional */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-slate-900">従来: React 自前実装</h3>
            <TraditionalDialog />
            <div className="mt-4 border-t border-slate-100 pt-4">
              <p className="text-xs font-medium text-slate-500 uppercase">解説</p>
              <p className="mt-1 text-xs text-slate-600">
                fixed inset-0 オーバーレイ、z-index 管理。フォーカストラップ、Esc
                リスニング、背景スクロール抑止などは自前実装が必要だが、ここでは省略。
              </p>
            </div>
          </div>

          {/* Open UI */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-slate-900">Open UI: ネイティブ</h3>
            <OpenUIDialog />
            <div className="mt-4 border-t border-slate-100 pt-4">
              <p className="text-xs font-medium text-slate-500 uppercase">解説</p>
              <p className="mt-1 text-xs text-slate-600">
                JavaScript ゼロ。&lt;dialog&gt; + Invoker Commands (commandfor +
                command=&quot;show-modal&quot; / &quot;close&quot;)
                で宣言的に開閉。::backdrop、フォーカス管理、Esc が標準。closedby=&quot;any&quot;
                で外側クリックによる light-dismiss も宣言的に有効化。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Accordion */}
      <section className="mb-12">
        <h2 className="mb-6 text-2xl font-bold text-slate-900">
          セクション 3: アコーディオン (旅行 FAQ)
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Traditional */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-slate-900">従来: React 自前実装</h3>
            <TraditionalAccordion />
            <div className="mt-4 border-t border-slate-100 pt-4">
              <p className="text-xs font-medium text-slate-500 uppercase">解説</p>
              <p className="mt-1 text-xs text-slate-600">
                useState で開いている項目の index を管理。ボタンで開閉。排他開閉は手動で実装。
              </p>
            </div>
          </div>

          {/* Open UI */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-slate-900">Open UI: ネイティブ</h3>
            <OpenUIAccordion />
            <div className="mt-4 border-t border-slate-100 pt-4">
              <p className="text-xs font-medium text-slate-500 uppercase">解説</p>
              <p className="mt-1 text-xs text-slate-600">
                &lt;details name=&quot;...&quot;&gt; で排他開閉が自動。JavaScript ゼロ。name
                属性で同じグループをまとめるだけ。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="mb-12">
        <h2 className="mb-6 text-2xl font-bold text-slate-900">比較表</h2>
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="border-b border-slate-200 px-3 py-2 text-left font-semibold text-slate-900">
                  観点
                </th>
                <th className="border-b border-slate-200 px-3 py-2 text-left font-semibold text-slate-900">
                  従来 (自前実装)
                </th>
                <th className="border-b border-slate-200 px-3 py-2 text-left font-semibold text-slate-900">
                  Open UI (ネイティブ)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="px-3 py-2 font-semibold text-slate-900">JavaScript 量</td>
                <td className="px-3 py-2 text-slate-600">多い (状態管理、イベント、DOM 操作)</td>
                <td className="px-3 py-2 text-slate-600">
                  ゼロ (command/commandfor で宣言的に開閉)
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-semibold text-slate-900">フォーカス管理</td>
                <td className="px-3 py-2 text-slate-600">自前実装が必要 (通常は未対応)</td>
                <td className="px-3 py-2 text-slate-600">ブラウザ標準で管理</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-semibold text-slate-900">キーボード操作</td>
                <td className="px-3 py-2 text-slate-600">自前実装が必要 (Esc など)</td>
                <td className="px-3 py-2 text-slate-600">ブラウザ標準で対応</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-semibold text-slate-900">
                  Light-dismiss (外側クリック)
                </td>
                <td className="px-3 py-2 text-slate-600">onClick/useClickOutside で実装</td>
                <td className="px-3 py-2 text-slate-600">
                  popover=&quot;auto&quot; / dialog closedby=&quot;any&quot; で自動
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-semibold text-slate-900">アクセシビリティ</td>
                <td className="px-3 py-2 text-slate-600">手動で role/aria 属性を追加</td>
                <td className="px-3 py-2 text-slate-600">セマンティクス標準で内包</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-semibold text-slate-900">ブラウザ対応</td>
                <td className="px-3 py-2 text-slate-600">すべてのブラウザ</td>
                <td className="px-3 py-2 text-slate-600">
                  popover/dialog/details に加え、command/commandfor も全主要ブラウザで Baseline 達成
                  (Chrome 135 / Firefox 144 / Safari 26.2)
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-semibold text-slate-900">デザイン自由度</td>
                <td className="px-3 py-2 text-slate-600">完全自由</td>
                <td className="px-3 py-2 text-slate-600">
                  ほぼ完全 (::backdrop など CSS で制御可)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Footer Note */}
      <footer className="border-t border-slate-200 pt-6 text-xs text-slate-500">
        <p>
          注: customizable &lt;select&gt; (appearance: base-select) は Chromium (Chrome 135+) と
          Safari 27 が対応済み、Firefox
          は開発中のため、このページではデモではなく注記のみとしています。 また dialog の closedby
          属性はまだ Baseline
          ではないため、プログレッシブエンハンスメントとして使用しています(未対応ブラウザでは単に無視されます)。
        </p>
      </footer>
    </main>
  );
}

// ============ Traditional Popover ============
function TraditionalPopover() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-lg bg-indigo-100 px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-200"
      >
        天気情報を表示
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-48 rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
          <p className="font-semibold text-slate-900">東京の天気</p>
          <p className="mt-1 text-sm text-slate-600">7月4日: 晴れ 28°C 湿度 60%</p>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="mt-2 text-xs text-indigo-600 hover:text-indigo-700"
          >
            閉じる
          </button>
        </div>
      )}
    </div>
  );
}

// ============ Open UI Popover ============
function OpenUIPopover() {
  return (
    <div>
      <button
        type="button"
        commandfor="tip-weather"
        command="toggle-popover"
        className="rounded-lg bg-indigo-100 px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-200"
      >
        天気情報を表示
      </button>
      <div
        id="tip-weather"
        popover="auto"
        className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg"
      >
        <p className="font-semibold text-slate-900">東京の天気</p>
        <p className="mt-1 text-sm text-slate-600">7月4日: 晴れ 28°C 湿度 60%</p>
      </div>
    </div>
  );
}

// ============ Traditional Dialog ============
function TraditionalDialog() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-lg bg-indigo-100 px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-200"
      >
        予約を確認
      </button>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
            <h3 className="font-semibold text-slate-900">予約確認</h3>
            <p className="mt-2 text-sm text-slate-600">パッケージ: 北海道3泊4日プラン</p>
            <p className="mt-1 text-sm text-slate-600">チェックイン: 2026年8月1日</p>
            <p className="mt-1 text-sm text-slate-600">金額: ¥248,000 (税込)</p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                確認
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============ Open UI Dialog ============
function OpenUIDialog() {
  return (
    <div>
      <button
        type="button"
        commandfor="booking-dialog"
        command="show-modal"
        className="rounded-lg bg-indigo-100 px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-200"
      >
        予約を確認
      </button>
      <dialog
        id="booking-dialog"
        closedby="any"
        className="m-auto rounded-2xl border border-slate-200 p-6 shadow-lg backdrop:bg-slate-900/50"
        aria-label="予約確認"
      >
        <h3 className="font-semibold text-slate-900">予約確認</h3>
        <p className="mt-2 text-sm text-slate-600">パッケージ: 北海道3泊4日プラン</p>
        <p className="mt-1 text-sm text-slate-600">チェックイン: 2026年8月1日</p>
        <p className="mt-1 text-sm text-slate-600">金額: ¥248,000 (税込)</p>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            commandfor="booking-dialog"
            command="close"
            className="flex-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            確認
          </button>
          <button
            type="button"
            commandfor="booking-dialog"
            command="close"
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            キャンセル
          </button>
        </div>
      </dialog>
    </div>
  );
}

// ============ Traditional Accordion ============
function TraditionalAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      {FAQ_ITEMS.map((faq, index) => (
        <div key={faq.id} className="rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full px-3 py-2 text-left font-medium text-slate-900 hover:bg-slate-50"
          >
            {faq.question}
          </button>
          {openIndex === index && (
            <div className="border-t border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
              {faq.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ============ Open UI Accordion ============
function OpenUIAccordion() {
  return (
    <div className="space-y-2">
      <details name="travel-faq" className="group rounded-lg border border-slate-200">
        <summary className="cursor-pointer px-3 py-2 font-medium text-slate-900 hover:bg-slate-50">
          キャンセル料はいつから発生しますか?
        </summary>
        <div className="border-t border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
          出発日の14日前から50%、7日前から100%のキャンセル料が発生します。
        </div>
      </details>

      <details name="travel-faq" className="group rounded-lg border border-slate-200">
        <summary className="cursor-pointer px-3 py-2 font-medium text-slate-900 hover:bg-slate-50">
          グループ割引はありますか?
        </summary>
        <div className="border-t border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
          6名以上の団体予約で10%割引、10名以上で15%割引があります。
        </div>
      </details>

      <details name="travel-faq" className="group rounded-lg border border-slate-200">
        <summary className="cursor-pointer px-3 py-2 font-medium text-slate-900 hover:bg-slate-50">
          ペットの同伴は可能ですか?
        </summary>
        <div className="border-t border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
          ペット同伴可能な宿泊施設もございます。予約時にご相談ください。
        </div>
      </details>
    </div>
  );
}
