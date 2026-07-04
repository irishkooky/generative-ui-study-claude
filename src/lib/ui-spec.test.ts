import { expect, test } from "vite-plus/test";

import { parseLooseSpec } from "./ui-spec";

test("完全な UI 仕様をパースできる", () => {
  const spec = parseLooseSpec({
    title: "北海道旅行プラン",
    description: "3泊4日の概要",
    sections: [
      { type: "card", title: "概要", body: "冬の北海道を満喫" },
      {
        type: "metrics",
        items: [{ label: "予算", value: "12万円", hint: "1人あたり" }],
      },
    ],
  });
  expect(spec.title).toBe("北海道旅行プラン");
  expect(spec.sections).toHaveLength(2);
});

test("ストリーミング中の書きかけセクションは捨てて完成分だけ返す", () => {
  const spec = parseLooseSpec({
    title: "生成中...",
    sections: [
      { type: "card", title: "完成済み", body: "OK" },
      { type: "list", items: [{ title: "書きかけ" }, { titl: "壊れた JSON 断片" }] },
      { type: "table", columns: ["A"] }, // rows 未到達
    ],
  });
  expect(spec.sections).toHaveLength(1);
  expect(spec.sections[0]?.type).toBe("card");
});

test("オブジェクト以外の入力では空のセクションを返す", () => {
  expect(parseLooseSpec(undefined).sections).toHaveLength(0);
  expect(parseLooseSpec("text").sections).toHaveLength(0);
  expect(parseLooseSpec(null).sections).toHaveLength(0);
});
