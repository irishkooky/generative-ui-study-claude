import { tool } from "ai";
import { z } from "zod";

import type { WeatherOutput } from "./travel-schemas";
import { budgetInputSchema, itineraryInputSchema } from "./travel-schemas";

/**
 * Static アプローチ用のツール定義 (サーバー専用)。
 * ツール名とクライアント側の固定 React コンポーネントが 1:1 で対応する。
 * (getWeather → WeatherCard, proposeItinerary → ItineraryCard, estimateBudget → BudgetCard)
 */

const CONDITIONS = ["sunny", "cloudy", "rainy", "snowy"] as const;

// 外部の天気 API の代わりとなる決定的なモック。同じ入力なら同じ結果を返す。
function simulateWeather(city: string, date: string): WeatherOutput {
  let hash = 0;
  for (const char of `${city}:${date}`) {
    hash = (hash * 31 + (char.codePointAt(0) ?? 0)) % 997;
  }
  const condition = CONDITIONS[hash % (date.includes("-12-") ? 4 : 3)] ?? "sunny";
  const highC = 8 + (hash % 22);
  return {
    city,
    date,
    condition,
    highC,
    lowC: highC - 6 - (hash % 5),
    precipitationPercent: condition === "rainy" ? 50 + (hash % 50) : hash % 40,
  };
}

export const travelTools = {
  getWeather: tool({
    description:
      "指定した都市・日付の天気予報を取得する。結果は天気カードとしてユーザーに表示される。旅行日程が話題になったら積極的に呼ぶこと。",
    inputSchema: z.object({
      city: z.string().describe("都市名 (例: 京都)"),
      date: z.string().describe("YYYY-MM-DD 形式の日付"),
    }),
    execute: ({ city, date }) => simulateWeather(city, date),
  }),
  proposeItinerary: tool({
    description:
      "旅行の日程表 (旅程) をタイムライン UI としてユーザーに提示する。日程の提案はテキストではなく必ずこのツールで行うこと。全フィールドを具体的な内容で埋める。",
    inputSchema: itineraryInputSchema,
    execute: ({ destination, days }) => ({
      status: "presented" as const,
      destination,
      dayCount: days.length,
    }),
  }),
  estimateBudget: tool({
    description:
      "旅行予算の内訳を予算カードとしてユーザーに提示する。費用の話はテキストではなく必ずこのツールで行うこと。",
    inputSchema: budgetInputSchema,
    execute: ({ items }) => ({
      total: items.reduce((sum, item) => sum + item.amount, 0),
    }),
  }),
};
