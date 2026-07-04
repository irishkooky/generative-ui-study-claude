import { z } from "zod";

/**
 * Declarative アプローチ用の UI 仕様スキーマ。
 * AI はこのスキーマに従った JSON を出力し、クライアントの汎用レンダラが
 * 事前定義済みコンポーネントに変換して描画する。
 */

export const cardSectionSchema = z.object({
  type: z.literal("card"),
  title: z.string(),
  body: z.string(),
  tone: z.enum(["default", "info", "success", "warning"]).optional(),
});

export const metricsSectionSchema = z.object({
  type: z.literal("metrics"),
  title: z.string().optional(),
  items: z.array(
    z.object({
      label: z.string(),
      value: z.string(),
      hint: z.string().optional(),
    }),
  ),
});

export const listSectionSchema = z.object({
  type: z.literal("list"),
  title: z.string().optional(),
  ordered: z.boolean().optional(),
  items: z.array(
    z.object({
      title: z.string(),
      description: z.string().optional(),
      badge: z.string().optional(),
    }),
  ),
});

export const tableSectionSchema = z.object({
  type: z.literal("table"),
  title: z.string().optional(),
  columns: z.array(z.string()),
  rows: z.array(z.array(z.string())),
});

export const progressSectionSchema = z.object({
  type: z.literal("progress"),
  title: z.string().optional(),
  items: z.array(
    z.object({
      label: z.string(),
      percent: z.number().min(0).max(100),
      caption: z.string().optional(),
    }),
  ),
});

export const actionsSectionSchema = z.object({
  type: z.literal("actions"),
  title: z.string().optional(),
  items: z.array(
    z.object({
      label: z.string(),
      message: z.string().describe("ボタン押下時にユーザーとして送信するメッセージ"),
    }),
  ),
});

export const uiSectionSchema = z.discriminatedUnion("type", [
  cardSectionSchema,
  metricsSectionSchema,
  listSectionSchema,
  tableSectionSchema,
  progressSectionSchema,
  actionsSectionSchema,
]);

export const uiSpecSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  sections: z.array(uiSectionSchema),
});

export type UISection = z.infer<typeof uiSectionSchema>;
export type UISpec = z.infer<typeof uiSpecSchema>;

/**
 * ストリーミング中の不完全な JSON から、描画可能なセクションだけを
 * 拾い上げる寛容パーサ。書きかけの末尾セクションは捨てる。
 */
export function parseLooseSpec(input: unknown): {
  title?: string;
  description?: string;
  sections: UISection[];
} {
  const sections: UISection[] = [];
  if (typeof input !== "object" || input === null) {
    return { sections };
  }
  const record = input as Record<string, unknown>;
  const title = typeof record["title"] === "string" ? record["title"] : undefined;
  const description = typeof record["description"] === "string" ? record["description"] : undefined;
  if (Array.isArray(record["sections"])) {
    for (const raw of record["sections"]) {
      const parsed = uiSectionSchema.safeParse(raw);
      if (parsed.success) {
        sections.push(parsed.data);
      }
    }
  }
  return { title, description, sections };
}
