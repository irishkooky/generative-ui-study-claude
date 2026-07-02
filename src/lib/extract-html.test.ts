import { expect, test } from "vite-plus/test";

import { extractHtml } from "./extract-html";

test("html フェンスから HTML と説明文を分離する", () => {
  const { html, prose } = extractHtml(
    "しおりを作りました。\n```html\n<!doctype html><h1>沖縄</h1>\n```\n以上です。",
  );
  expect(html).toBe("<!doctype html><h1>沖縄</h1>\n");
  expect(prose).toContain("しおりを作りました。");
  expect(prose).toContain("以上です。");
});

test("ストリーミング中 (閉じフェンス未到達) でも部分 HTML を返す", () => {
  const { html } = extractHtml("生成します。\n```html\n<!doctype html><body><h1>途中");
  expect(html).toBe("<!doctype html><body><h1>途中");
});

test("フェンスがなければ html は null", () => {
  const { html, prose } = extractHtml("ただのテキスト");
  expect(html).toBeNull();
  expect(prose).toBe("ただのテキスト");
});
