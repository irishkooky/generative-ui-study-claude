import { cn } from "cnfast";

import type { BudgetInput, ItineraryInput, WeatherOutput } from "../lib/travel-schemas";

/**
 * Static アプローチの本体: ツール名 1つにつき固定コンポーネント1つ。
 * AI は「どれを出すか」と「中身のデータ」だけを決め、見た目はここで完全に制御する。
 */

const WEATHER_META: Record<
  WeatherOutput["condition"],
  { icon: string; label: string; className: string }
> = {
  sunny: { icon: "☀️", label: "晴れ", className: "from-amber-50 to-orange-50 border-amber-200" },
  cloudy: { icon: "☁️", label: "くもり", className: "from-slate-50 to-slate-100 border-slate-200" },
  rainy: { icon: "🌧️", label: "雨", className: "from-sky-50 to-blue-50 border-sky-200" },
  snowy: { icon: "❄️", label: "雪", className: "from-indigo-50 to-slate-50 border-indigo-200" },
};

export function WeatherCard({ weather }: { weather: WeatherOutput }) {
  const meta = WEATHER_META[weather.condition];
  return (
    <div
      className={cn("max-w-sm rounded-2xl border bg-gradient-to-br p-4 shadow-sm", meta.className)}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500">
            {weather.date} の {weather.city}
          </p>
          <p className="mt-0.5 text-lg font-bold text-slate-900">
            {meta.icon} {meta.label}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-slate-900">{weather.highC}°</p>
          <p className="text-xs text-slate-500">最低 {weather.lowC}°</p>
        </div>
      </div>
      <p className="mt-2 text-xs text-slate-600">降水確率 {weather.precipitationPercent}%</p>
    </div>
  );
}

export function ItineraryCard({ itinerary }: { itinerary: ItineraryInput }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-bold text-slate-900">🗺️ {itinerary.destination} の旅程</p>
      <div className="mt-3 space-y-4">
        {itinerary.days.map((day) => (
          <div key={day.day}>
            <p className="text-xs font-semibold tracking-wide text-indigo-600">
              DAY {day.day} — {day.theme}
            </p>
            <ol className="mt-2 space-y-2 border-l-2 border-indigo-100 pl-4">
              {day.stops.map((stop) => (
                <li key={`${day.day}-${stop.time}-${stop.title}`} className="relative">
                  <span className="absolute top-1.5 -left-[21px] size-2 rounded-full bg-indigo-400" />
                  <p className="text-sm text-slate-800">
                    <span className="mr-2 font-mono text-xs text-slate-400">{stop.time}</span>
                    {stop.title}
                  </p>
                  {stop.note ? <p className="text-xs text-slate-500">{stop.note}</p> : null}
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </div>
  );
}

const formatterCache = new Map<string, Intl.NumberFormat>();

function currencyFormatter(currency: string): Intl.NumberFormat {
  let formatter = formatterCache.get(currency);
  if (!formatter) {
    // 通貨コードが動的なためモジュール先頭に置けない。Map でキャッシュ済み。
    // oxlint-disable-next-line react-doctor/js-hoist-intl
    formatter = new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    });
    formatterCache.set(currency, formatter);
  }
  return formatter;
}

export function BudgetCard({ budget }: { budget: BudgetInput }) {
  const total = budget.items.reduce((sum, item) => sum + item.amount, 0);
  const formatter = currencyFormatter(budget.currency || "JPY");
  const max = Math.max(...budget.items.map((item) => item.amount), 1);
  return (
    <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-bold text-slate-900">💰 {budget.title}</p>
        <p className="text-lg font-bold text-emerald-600">{formatter.format(total)}</p>
      </div>
      <ul className="mt-3 space-y-2">
        {budget.items.map((item) => (
          <li key={item.label}>
            <div className="flex justify-between text-xs text-slate-600">
              <span>{item.label}</span>
              <span className="font-medium">{formatter.format(item.amount)}</span>
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-slate-100">
              <div
                className="h-1.5 rounded-full bg-emerald-400"
                style={{ width: `${String((item.amount / max) * 100)}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ToolPending({ label }: { label: string }) {
  return (
    <div className="max-w-sm animate-pulse rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-400">
      {label}
    </div>
  );
}
