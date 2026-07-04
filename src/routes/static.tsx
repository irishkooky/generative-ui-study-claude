import { createFileRoute } from "@tanstack/react-router";

import { ChatShell } from "../components/chat-shell";
import { BudgetCard, ItineraryCard, ToolPending, WeatherCard } from "../components/travel-cards";
import {
  budgetInputSchema,
  itineraryInputSchema,
  weatherOutputSchema,
} from "../lib/travel-schemas";

export const Route = createFileRoute("/static")({
  component: StaticPage,
});

function StaticPage() {
  return (
    <ChatShell
      mode="static"
      title="Level 1: Static"
      tagline="AI はツールで「どのコンポーネントを出すか」を選ぶだけ。UI は事前定義の React コンポーネント。"
      suggestions={[
        "来月の3連休に京都へ2泊3日で行きたい。天気も知りたい",
        "北海道で温泉とグルメの旅程を組んで",
        "大人2人の沖縄3泊4日、予算感を教えて",
      ]}
      renderPart={(part) => {
        switch (part.type) {
          case "tool-getWeather": {
            if (part.state === "output-available") {
              const output = weatherOutputSchema.safeParse(part.output);
              if (output.success) return <WeatherCard weather={output.data} />;
            }
            if (part.state === "output-error") {
              return <ToolPending label="天気の取得に失敗しました" />;
            }
            return <ToolPending label="🌤️ 天気を取得中..." />;
          }
          case "tool-proposeItinerary": {
            const input = itineraryInputSchema.safeParse(part.input);
            if (input.success) return <ItineraryCard itinerary={input.data} />;
            return <ToolPending label="🗺️ 旅程を作成中..." />;
          }
          case "tool-estimateBudget": {
            const input = budgetInputSchema.safeParse(part.input);
            if (input.success) return <BudgetCard budget={input.data} />;
            return <ToolPending label="💰 予算を計算中..." />;
          }
          default:
            return null;
        }
      }}
    />
  );
}
