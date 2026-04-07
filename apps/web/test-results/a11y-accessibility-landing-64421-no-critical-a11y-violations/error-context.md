# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: a11y.test.ts >> accessibility >> landing page has no critical a11y violations
- Location: e2e/a11y.test.ts:5:7

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  -   1
+ Received  + 391

- Array []
+ Array [
+   Object {
+     "description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds",
+     "help": "Elements must meet minimum color contrast ratio thresholds",
+     "helpUrl": "https://dequeuniversity.com/rules/axe/4.11/color-contrast?application=playwright",
+     "id": "color-contrast",
+     "impact": "serious",
+     "nodes": Array [
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#00a63e",
+               "contrastRatio": 3.21,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#ffffff",
+               "fontSize": "12.0pt (16px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3.21 (foreground color: #ffffff, background color: #00a63e, font size: 12.0pt (16px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<button type=\"submit\" aria-label=\"Scan repository\" class=\"bg-green-600 hover:b...\">",
+                 "target": Array [
+                   ".bg-green-600",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.21 (foreground color: #ffffff, background color: #00a63e, font size: 12.0pt (16px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<button type=\"submit\" aria-label=\"Scan repository\" class=\"bg-green-600 hover:b...\">",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".bg-green-600",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#0f172a",
+               "contrastRatio": 3.74,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#62748e",
+               "fontSize": "9.0pt (12px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3.74 (foreground color: #62748e, background color: #0f172a, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<div class=\"min-h-dvh bg-background text-slate-200 flex items-center px-6\">",
+                 "target": Array [
+                   ".min-h-dvh",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.74 (foreground color: #62748e, background color: #0f172a, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<span class=\"text-xs text-slate-500\">Try:</span>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".flex-wrap > .text-xs.text-slate-500:nth-child(1)",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#0f172a",
+               "contrastRatio": 3.74,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#62748e",
+               "fontSize": "9.0pt (12px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3.74 (foreground color: #62748e, background color: #0f172a, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<div class=\"min-h-dvh bg-background text-slate-200 flex items-center px-6\">",
+                 "target": Array [
+                   ".min-h-dvh",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.74 (foreground color: #62748e, background color: #0f172a, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<button class=\"text-xs text-slate-500 hover:text-green-400 transition-colors duration-150 font-mono active:scale-[0.97]\">expressjs/express</button>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".hover\\:text-green-400.duration-150.transition-colors:nth-child(2)",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#0f172a",
+               "contrastRatio": 3.74,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#62748e",
+               "fontSize": "9.0pt (12px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3.74 (foreground color: #62748e, background color: #0f172a, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<div class=\"min-h-dvh bg-background text-slate-200 flex items-center px-6\">",
+                 "target": Array [
+                   ".min-h-dvh",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.74 (foreground color: #62748e, background color: #0f172a, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<button class=\"text-xs text-slate-500 hover:text-green-400 transition-colors duration-150 font-mono active:scale-[0.97]\">facebook/react</button>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".hover\\:text-green-400.duration-150.transition-colors:nth-child(3)",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#0f172a",
+               "contrastRatio": 3.74,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#62748e",
+               "fontSize": "9.0pt (12px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3.74 (foreground color: #62748e, background color: #0f172a, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<div class=\"min-h-dvh bg-background text-slate-200 flex items-center px-6\">",
+                 "target": Array [
+                   ".min-h-dvh",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.74 (foreground color: #62748e, background color: #0f172a, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<button class=\"text-xs text-slate-500 hover:text-green-400 transition-colors duration-150 font-mono active:scale-[0.97]\">vercel/next.js</button>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".hover\\:text-green-400.duration-150.transition-colors:nth-child(4)",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#222a3d",
+               "contrastRatio": 3,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#62748e",
+               "fontSize": "9.0pt (12px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3 (foreground color: #62748e, background color: #222a3d, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<div class=\"bg-ds-muted/80 border border-ds-border/40 rounded-2xl p-6 w-[340px] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.4)]\">",
+                 "target": Array [
+                   ".bg-ds-muted\\/80",
+                 ],
+               },
+               Object {
+                 "html": "<div class=\"min-h-dvh bg-background text-slate-200 flex items-center px-6\">",
+                 "target": Array [
+                   ".min-h-dvh",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3 (foreground color: #62748e, background color: #222a3d, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<span class=\"text-xs text-slate-500 ml-2 font-mono\">scan results</span>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".ml-2",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#f54900",
+               "contrastRatio": 3.59,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#ffffff",
+               "fontSize": "7.2pt (9.6px)",
+               "fontWeight": "bold",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3.59 (foreground color: #ffffff, background color: #f54900, font size: 7.2pt (9.6px), font weight: bold). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<span class=\"text-[0.6rem] font-bold uppercase px-1.5 py-0.5 rounded bg-orange-600 text-white\">high</span>",
+                 "target": Array [
+                   ".bg-orange-600",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.59 (foreground color: #ffffff, background color: #f54900, font size: 7.2pt (9.6px), font weight: bold). Expected contrast ratio of 4.5:1",
+         "html": "<span class=\"text-[0.6rem] font-bold uppercase px-1.5 py-0.5 rounded bg-orange-600 text-white\">high</span>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".bg-orange-600",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#d08700",
+               "contrastRatio": 2.93,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#ffffff",
+               "fontSize": "7.2pt (9.6px)",
+               "fontWeight": "bold",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 2.93 (foreground color: #ffffff, background color: #d08700, font size: 7.2pt (9.6px), font weight: bold). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<span class=\"text-[0.6rem] font-bold uppercase px-1.5 py-0.5 rounded bg-yellow-600 text-white\">medium</span>",
+                 "target": Array [
+                   ".bg-yellow-600",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 2.93 (foreground color: #ffffff, background color: #d08700, font size: 7.2pt (9.6px), font weight: bold). Expected contrast ratio of 4.5:1",
+         "html": "<span class=\"text-[0.6rem] font-bold uppercase px-1.5 py-0.5 rounded bg-yellow-600 text-white\">medium</span>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".bg-yellow-600",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#222a3d",
+               "contrastRatio": 3,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#62748e",
+               "fontSize": "9.0pt (12px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3 (foreground color: #62748e, background color: #222a3d, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<div class=\"bg-ds-muted/80 border border-ds-border/40 rounded-2xl p-6 w-[340px] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.4)]\">",
+                 "target": Array [
+                   ".bg-ds-muted\\/80",
+                 ],
+               },
+               Object {
+                 "html": "<div class=\"min-h-dvh bg-background text-slate-200 flex items-center px-6\">",
+                 "target": Array [
+                   ".min-h-dvh",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3 (foreground color: #62748e, background color: #222a3d, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<span class=\"text-xs text-slate-500\">Score</span>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".justify-between.flex.items-center > .text-xs.text-slate-500",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#222a3d",
+               "contrastRatio": 3.76,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#fb2c36",
+               "fontSize": "10.5pt (14px)",
+               "fontWeight": "bold",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3.76 (foreground color: #fb2c36, background color: #222a3d, font size: 10.5pt (14px), font weight: bold). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<div class=\"bg-ds-muted/80 border border-ds-border/40 rounded-2xl p-6 w-[340px] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.4)]\">",
+                 "target": Array [
+                   ".bg-ds-muted\\/80",
+                 ],
+               },
+               Object {
+                 "html": "<div class=\"min-h-dvh bg-background text-slate-200 flex items-center px-6\">",
+                 "target": Array [
+                   ".min-h-dvh",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.76 (foreground color: #fb2c36, background color: #222a3d, font size: 10.5pt (14px), font weight: bold). Expected contrast ratio of 4.5:1",
+         "html": "<span class=\"text-sm font-bold text-red-500 font-mono\">F — 12/100</span>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".text-red-500.font-bold.font-mono",
+         ],
+       },
+     ],
+     "tags": Array [
+       "cat.color",
+       "wcag2aa",
+       "wcag143",
+       "TTv5",
+       "TT13.c",
+       "EN-301-549",
+       "EN-9.1.4.3",
+       "ACT",
+       "RGAAv4",
+       "RGAA-3.2.1",
+     ],
+   },
+ ]
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - link "Skip to content" [ref=e2] [cursor=pointer]:
    - /url: "#main-content"
  - banner [ref=e3]:
    - link "git. exposed" [ref=e4] [cursor=pointer]:
      - /url: /
      - img [ref=e5]
      - text: git.
      - generic [ref=e6]: exposed
    - button "Sign in with GitHub" [ref=e7]:
      - img [ref=e8]
      - text: Sign in
  - generic [ref=e11]:
    - generic [ref=e12]:
      - heading "git.exposed" [level=1] [ref=e13]
      - paragraph [ref=e14]: Find exposed secrets and vulnerabilities in any GitHub repo.
      - paragraph [ref=e15]: 150+ secret patterns · 3,000+ security rules · Real CVE database
      - generic [ref=e16]:
        - textbox "GitHub repository URL" [ref=e17]:
          - /placeholder: https://github.com/owner/repo
        - button "Scan repository" [ref=e18]: Scan
      - generic [ref=e19]:
        - generic [ref=e20]: "Try:"
        - button "expressjs/express" [ref=e21]
        - button "facebook/react" [ref=e22]
        - button "vercel/next.js" [ref=e23]
      - paragraph [ref=e24]:
        - text: Free for public repos · No signup required
        - generic [ref=e25]: · 14 repos scanned
    - generic [ref=e28]:
      - generic [ref=e33]: scan results
      - generic [ref=e34]:
        - generic [ref=e35]:
          - generic [ref=e36]: critical
          - generic [ref=e37]: Hardcoded API key
        - generic [ref=e38]:
          - generic [ref=e39]: high
          - generic [ref=e40]: SQL injection risk
        - generic [ref=e41]:
          - generic [ref=e42]: medium
          - generic [ref=e43]: Outdated dependency
      - generic [ref=e45]:
        - generic [ref=e46]: Score
        - generic [ref=e47]: F — 12/100
  - alert [ref=e49]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import AxeBuilder from '@axe-core/playwright';
  3  | 
  4  | test.describe('accessibility', () => {
  5  |   test('landing page has no critical a11y violations', async ({ page }) => {
  6  |     await page.goto('/');
  7  |     await page.waitForLoadState('networkidle');
  8  | 
  9  |     const results = await new AxeBuilder({ page })
  10 |       .withTags(['wcag2a', 'wcag2aa'])
  11 |       .analyze();
  12 | 
  13 |     const critical = results.violations.filter(
  14 |       (v) => v.impact === 'critical' || v.impact === 'serious',
  15 |     );
> 16 |     expect(critical).toEqual([]);
     |                      ^ Error: expect(received).toEqual(expected) // deep equality
  17 |   });
  18 | 
  19 |   test('report page has no critical a11y violations', async ({ page }) => {
  20 |     await page.goto('/expressjs/express');
  21 |     await page.waitForLoadState('networkidle');
  22 | 
  23 |     const results = await new AxeBuilder({ page })
  24 |       .withTags(['wcag2a', 'wcag2aa'])
  25 |       .analyze();
  26 | 
  27 |     const critical = results.violations.filter(
  28 |       (v) => v.impact === 'critical' || v.impact === 'serious',
  29 |     );
  30 |     expect(critical).toEqual([]);
  31 |   });
  32 | 
  33 |   test('signin page has no critical a11y violations', async ({ page }) => {
  34 |     await page.goto('/signin');
  35 |     await page.waitForLoadState('networkidle');
  36 | 
  37 |     const results = await new AxeBuilder({ page })
  38 |       .withTags(['wcag2a', 'wcag2aa'])
  39 |       .analyze();
  40 | 
  41 |     const critical = results.violations.filter(
  42 |       (v) => v.impact === 'critical' || v.impact === 'serious',
  43 |     );
  44 |     expect(critical).toEqual([]);
  45 |   });
  46 | });
  47 | 
```