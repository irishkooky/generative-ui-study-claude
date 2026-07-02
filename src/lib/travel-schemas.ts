import { z } from "zod";

/**
 * Static アプローチのツール入出力スキーマ。
 * サーバー (ツール定義) とクライアント (カード描画時の検証) で共有する。
 */

export const weatherOutputSchema = z.object({
  city: z.string(),
  date: z.string(),
  condition: z.enum(["sunny", "cloudy", "rainy", "snowy"]),
  highC: z.number(),
  lowC: z.number(),
  precipitationPercent: z.number(),
});

export type WeatherOutput = z.infer<typeof weatherOutputSchema>;

export const itineraryInputSchema = z.object({
  destination: z.string(),
  days: z.array(
    z.object({
      day: z.number().describe("1 始まりの日数"),
      theme: z.string().describe("その日のテーマ (例: 嵐山エリア散策)"),
      stops: z.array(
        z.object({
          time: z.string().describe("HH:mm 形式"),
          title: z.string(),
          note: z.string().optional(),
        }),
      ),
    }),
  ),
});

export type ItineraryInput = z.infer<typeof itineraryInputSchema>;

export const budgetInputSchema = z.object({
  title: z.string().describe("例: 京都2泊3日 (大人2名)"),
  currency: z.string().describe("通貨コード。日本円なら JPY"),
  items: z.array(
    z.object({
      label: z.string().describe("費目 (例: 宿泊費)"),
      amount: z.number().describe("金額"),
    }),
  ),
});

export type BudgetInput = z.infer<typeof budgetInputSchema>;
