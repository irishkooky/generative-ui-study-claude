import { createFileRoute } from "@tanstack/react-router";

import { ChatShell } from "../components/chat-shell";
import { SpecRenderer } from "../components/spec-renderer";

export const Route = createFileRoute("/declarative")({
  component: DeclarativePage,
});

function DeclarativePage() {
  return (
    <ChatShell
      mode="declarative"
      title="Level 2: Declarative"
      tagline="AI が UI 仕様 (JSON) を宣言し、汎用レンダラがコンポーネントカタログに変換して描画する。"
      suggestions={[
        "冬の北海道旅行の計画をダッシュボードにまとめて",
        "京都・大阪・奈良、それぞれの魅力を比較して",
        "海外旅行の持ち物チェックリストを作って",
      ]}
      renderPart={(part, context) => {
        if (part.type === "tool-renderUI") {
          return (
            <SpecRenderer
              input={part.input}
              streaming={part.state === "input-streaming"}
              onAction={context.send}
            />
          );
        }
        return null;
      }}
    />
  );
}
