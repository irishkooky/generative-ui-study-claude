const HTML_FENCE = /```html\s*\n([\s\S]*?)(?:```|$)/;

/**
 * アシスタントのテキストから ```html フェンスの中身を取り出す。
 * ストリーミング中は閉じフェンスが未到達でも部分 HTML を返す。
 */
export function extractHtml(text: string): { html: string | null; prose: string } {
  const match = HTML_FENCE.exec(text);
  if (!match) {
    return { html: null, prose: text };
  }
  const prose = text.replace(match[0], "").trim();
  return { html: match[1] ?? "", prose };
}
