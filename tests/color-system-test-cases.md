# Test Cases: Color System (SACW — Hướng 1: Indigo + AI accent)

Phạm vi: kiểm thử bảng màu, semantic tokens và tính nhất quán trên Board / Backlog / Sprint / Dashboard / AI chat.

## 0. Phát hiện từ tính toán contrast (chạy thật)

| Cặp màu (fg / bg) | Ratio | Kết quả |
|---|---|---|
| `#4F46E5` / `#FFFFFF` (primary text/link) | 6.29 | PASS AA |
| `#FFFFFF` / `#4F46E5` (chữ trên nút primary) | 6.29 | PASS AA |
| `#FFFFFF` / `#4338CA` (nút hover) | 7.90 | PASS AA |
| `#0F172A` / `#F8FAFC` (text chính) | 17.06 | PASS AAA |
| `#475569` / `#F8FAFC` (text phụ) | 7.24 | PASS AA |
| `#CBD5E1` / `#FFFFFF` (border) | 1.48 | FAIL nếu border là ranh giới duy nhất của input (cần 3:1) |
| `#0EA5E9` / `#FFFFFF` (sky làm chữ) | 2.77 | FAIL, chỉ dùng làm nền/icon |
| `#16A34A` / `#FFFFFF` (green làm chữ) | 3.30 | FAIL, dùng `#15803D` |
| `#D97706` / `#FFFFFF` (amber làm chữ) | 3.19 | FAIL, dùng `#B45309` |
| `#DC2626` / `#FFFFFF` (red làm chữ) | 4.83 | PASS AA |
| `#06B6D4` / `#FFFFFF` (cyan trong gradient AI) | 2.43 | FAIL làm chữ, chỉ dùng trang trí |
| `#818CF8` / `#0B1020` (primary dark mode) | 6.35 | PASS AA |

Chip trạng thái (chữ đậm trên nền nhạt) đã đạt:
`#0369A1/#E0F2FE` 5.17 · `#15803D/#DCFCE7` 4.57 · `#B45309/#FEF3C7` 4.51 · `#B91C1C/#FEE2E2` 5.30

**Kết luận:** không dùng các màu 500/600 gốc của Sky/Green/Amber làm màu chữ. Dùng bộ "chip" ở trên.

## 1. Design tokens dùng để test

```css
:root {
  --color-primary: #4F46E5;
  --color-primary-hover: #4338CA;
  --color-text: #0F172A;
  --color-text-secondary: #475569;
  --color-bg: #F8FAFC;
  --color-surface: #FFFFFF;
  --color-border: #CBD5E1;
  --color-border-strong: #64748B;   /* cho input/UI component, >= 3:1 */

  --color-status-todo-fg: #475569;   --color-status-todo-bg: #F1F5F9;
  --color-status-progress-fg: #0369A1; --color-status-progress-bg: #E0F2FE;
  --color-status-done-fg: #15803D;   --color-status-done-bg: #DCFCE7;
  --color-status-warning-fg: #B45309; --color-status-warning-bg: #FEF3C7;
  --color-status-blocked-fg: #B91C1C; --color-status-blocked-bg: #FEE2E2;

  --color-ai-gradient: linear-gradient(135deg, #7C3AED, #06B6D4);
}
```

## 2. Automated: contrast (Vitest)

```ts
// color-contrast.test.ts
import { describe, it, expect } from "vitest";

const lum = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map(c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a: string, b: string) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const textPairs: [string, string, string][] = [
  ["text / bg", "#0F172A", "#F8FAFC"],
  ["secondary / bg", "#475569", "#F8FAFC"],
  ["primary btn", "#FFFFFF", "#4F46E5"],
  ["primary hover", "#FFFFFF", "#4338CA"],
  ["chip todo", "#475569", "#F1F5F9"],
  ["chip progress", "#0369A1", "#E0F2FE"],
  ["chip done", "#15803D", "#DCFCE7"],
  ["chip warning", "#B45309", "#FEF3C7"],
  ["chip blocked", "#B91C1C", "#FEE2E2"],
  ["dark primary", "#818CF8", "#0B1020"],
];

describe("WCAG AA text >= 4.5:1", () => {
  it.each(textPairs)("%s", (_n, fg, bg) => {
    expect(ratio(fg, bg)).toBeGreaterThanOrEqual(4.5);
  });
});

describe("WCAG non-text UI >= 3:1", () => {
  it("input border on surface", () => {
    expect(ratio("#64748B", "#FFFFFF")).toBeGreaterThanOrEqual(3);
  });
});

describe("Known-bad pairs must NOT be used as text", () => {
  it.each([
    ["#0EA5E9", "#FFFFFF"], ["#16A34A", "#FFFFFF"],
    ["#D97706", "#FFFFFF"], ["#06B6D4", "#FFFFFF"],
  ])("%s on %s < 4.5", (fg, bg) => {
    expect(ratio(fg, bg)).toBeLessThan(4.5);
  });
});
```

## 3. Automated: token usage lint

```ts
// no-raw-hex.test.ts — chặn hex cứng trong component
import { readFileSync } from "fs";
import { globSync } from "glob";

it("components dùng token, không hardcode hex", () => {
  const offenders = globSync("src/components/**/*.{tsx,css}").filter(f =>
    /#[0-9a-fA-F]{6}\b/.test(readFileSync(f, "utf8"))
  );
  expect(offenders).toEqual([]);
});
```

## 4. Automated: axe + visual (Playwright)

```ts
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const page of ["/board", "/backlog", "/sprint", "/dashboard", "/ai"]) {
  for (const scheme of ["light", "dark"] as const) {
    test(`${page} [${scheme}] không lỗi color-contrast`, async ({ browser }) => {
      const ctx = await browser.newContext({ colorScheme: scheme });
      const p = await ctx.newPage();
      await p.goto(page);
      const res = await new AxeBuilder({ page: p }).withRules(["color-contrast"]).analyze();
      expect(res.violations).toEqual([]);
    });

    test(`${page} [${scheme}] visual snapshot`, async ({ browser }) => {
      const ctx = await browser.newContext({ colorScheme: scheme });
      const p = await ctx.newPage();
      await p.goto(page);
      await expect(p).toHaveScreenshot(`${page.slice(1)}-${scheme}.png`);
    });
  }
}
```

## 5. Manual test cases

| ID | Tình huống | Bước | Kỳ vọng |
|---|---|---|---|
| TC-01 | Primary vs Information | Mở Board, so nút "Create Sprint" với chip "In Progress" | Phân biệt được ngay, không cùng tông |
| TC-02 | Nhất quán trạng thái | Xem "Blocked" ở Board, Backlog, Sprint, Dashboard | Cùng 1 màu/icon ở mọi nơi |
| TC-03 | Priority ≠ Status | Task High + In Progress | Priority là icon, status là chip, không đè màu nhau |
| TC-04 | Không phụ thuộc màu | Bật bộ lọc grayscale (DevTools > Rendering) | Vẫn đọc được status/priority nhờ nhãn/icon |
| TC-05 | Mù màu | DevTools giả lập Protanopia, Deuteranopia, Tritanopia | Done/Blocked/Warning vẫn phân biệt nhờ icon + chữ |
| TC-06 | AI tách biệt | Mở khung chat AI và thẻ do AI gợi ý | Gradient/viền AI chỉ xuất hiện ở phần AI, không ở nút Scrum |
| TC-07 | Focus ring | Tab qua nút, input, thẻ task | Ring nhìn rõ trên nền sáng và tối (>= 3:1) |
| TC-08 | Hover/active/disabled | Rê/nhấn/disable nút primary | Hover `#4338CA`; disabled không bị nhầm là hoạt động |
| TC-09 | Dark mode | Chuyển theme | Không còn chữ/nền cứng màu sáng; primary đổi sang `#818CF8` |
| TC-10 | Ánh sáng mạnh | Xem trên điện thoại ngoài trời / giảm độ sáng 30% | Text phụ và border vẫn đọc được |
| TC-11 | Zoom 200% | Zoom trình duyệt | Chip, badge không mất màu/chồng chữ |
| TC-12 | Màu quá nhiều | Board đủ 3 cột, 10+ task | Chỉ 1 điểm nhấn mạnh trên mỗi vùng nhìn |

## 6. Tiêu chí pass

- 100% test contrast tự động pass; không có cặp "known-bad" nào xuất hiện làm chữ.
- Axe `color-contrast`: 0 violation ở cả light và dark.
- TC-01 → TC-12 pass; lỗi nào cũng ghi kèm ảnh chụp.
