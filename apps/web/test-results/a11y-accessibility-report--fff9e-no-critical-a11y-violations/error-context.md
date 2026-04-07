# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: a11y.test.ts >> accessibility >> report page has no critical a11y violations
- Location: e2e/a11y.test.ts:19:7

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
+               "bgColor": "#f54900",
+               "contrastRatio": 3.59,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#ffffff",
+               "fontSize": "9.0pt (12px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3.59 (foreground color: #ffffff, background color: #f54900, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<span class=\"bg-orange-600 text-white text-xs font-semibold px-3 py-1 rounded-full\">2<!-- --> <!-- -->high</span>",
+                 "target": Array [
+                   ".bg-orange-600",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.59 (foreground color: #ffffff, background color: #f54900, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<span class=\"bg-orange-600 text-white text-xs font-semibold px-3 py-1 rounded-full\">2<!-- --> <!-- -->high</span>",
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
+               "fontSize": "9.0pt (12px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 2.93 (foreground color: #ffffff, background color: #d08700, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<span class=\"bg-yellow-600 text-white text-xs font-semibold px-3 py-1 rounded-full\">1<!-- --> <!-- -->medium</span>",
+                 "target": Array [
+                   ".bg-yellow-600",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 2.93 (foreground color: #ffffff, background color: #d08700, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<span class=\"bg-yellow-600 text-white text-xs font-semibold px-3 py-1 rounded-full\">1<!-- --> <!-- -->medium</span>",
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
+               "bgColor": "#ea580c",
+               "contrastRatio": 3.55,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#ffffff",
+               "fontSize": "7.8pt (10.4px)",
+               "fontWeight": "bold",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3.55 (foreground color: #ffffff, background color: #ea580c, font size: 7.8pt (10.4px), font weight: bold). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<span class=\"text-[0.65rem] font-bold uppercase px-2 py-0.5 rounded text-white\" style=\"background:#ea580c\">high</span>",
+                 "target": Array [
+                   ".bg-ds-muted.p-4.border-l-\\[3px\\]:nth-child(3) > .mb-2.gap-2.items-center > .px-2.py-0\\.5.text-\\[0\\.65rem\\]",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.55 (foreground color: #ffffff, background color: #ea580c, font size: 7.8pt (10.4px), font weight: bold). Expected contrast ratio of 4.5:1",
+         "html": "<span class=\"text-[0.65rem] font-bold uppercase px-2 py-0.5 rounded text-white\" style=\"background:#ea580c\">high</span>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".bg-ds-muted.p-4.border-l-\\[3px\\]:nth-child(3) > .mb-2.gap-2.items-center > .px-2.py-0\\.5.text-\\[0\\.65rem\\]",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#ea580c",
+               "contrastRatio": 3.55,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#ffffff",
+               "fontSize": "7.8pt (10.4px)",
+               "fontWeight": "bold",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3.55 (foreground color: #ffffff, background color: #ea580c, font size: 7.8pt (10.4px), font weight: bold). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<span class=\"text-[0.65rem] font-bold uppercase px-2 py-0.5 rounded text-white\" style=\"background:#ea580c\">high</span>",
+                 "target": Array [
+                   ".bg-ds-muted.p-4.border-l-\\[3px\\]:nth-child(5) > .mb-2.gap-2.items-center > .px-2.py-0\\.5.text-\\[0\\.65rem\\]",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.55 (foreground color: #ffffff, background color: #ea580c, font size: 7.8pt (10.4px), font weight: bold). Expected contrast ratio of 4.5:1",
+         "html": "<span class=\"text-[0.65rem] font-bold uppercase px-2 py-0.5 rounded text-white\" style=\"background:#ea580c\">high</span>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".bg-ds-muted.p-4.border-l-\\[3px\\]:nth-child(5) > .mb-2.gap-2.items-center > .px-2.py-0\\.5.text-\\[0\\.65rem\\]",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#ca8a04",
+               "contrastRatio": 2.93,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#ffffff",
+               "fontSize": "7.8pt (10.4px)",
+               "fontWeight": "bold",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 2.93 (foreground color: #ffffff, background color: #ca8a04, font size: 7.8pt (10.4px), font weight: bold). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<span class=\"text-[0.65rem] font-bold uppercase px-2 py-0.5 rounded text-white\" style=\"background:#ca8a04\">medium</span>",
+                 "target": Array [
+                   ".bg-ds-muted.p-4.border-l-\\[3px\\]:nth-child(6) > .mb-2.gap-2.items-center > .px-2.py-0\\.5.text-\\[0\\.65rem\\]",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 2.93 (foreground color: #ffffff, background color: #ca8a04, font size: 7.8pt (10.4px), font weight: bold). Expected contrast ratio of 4.5:1",
+         "html": "<span class=\"text-[0.65rem] font-bold uppercase px-2 py-0.5 rounded text-white\" style=\"background:#ca8a04\">medium</span>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".bg-ds-muted.p-4.border-l-\\[3px\\]:nth-child(6) > .mb-2.gap-2.items-center > .px-2.py-0\\.5.text-\\[0\\.65rem\\]",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#1b1e28",
+               "contrastRatio": 3.49,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#62748e",
+               "fontSize": "9.0pt (12px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3.49 (foreground color: #62748e, background color: #1b1e28, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<div class=\"mt-6 p-5 rounded-lg border border-amber-500/20 bg-amber-500/5 text-center\">",
+                 "target": Array [
+                   ".mt-6",
+                 ],
+               },
+               Object {
+                 "html": "<div class=\"min-h-dvh bg-background text-slate-200\">",
+                 "target": Array [
+                   ".min-h-dvh",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.49 (foreground color: #62748e, background color: #1b1e28, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<p class=\"text-xs text-slate-500 mb-3\">AI generates a PR with fixes - you just review and merge.</p>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".mb-3",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#1b1e28",
+               "contrastRatio": 2.19,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#45556c",
+               "fontSize": "7.8pt (10.4px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 2.19 (foreground color: #45556c, background color: #1b1e28, font size: 7.8pt (10.4px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<div class=\"mt-6 p-5 rounded-lg border border-amber-500/20 bg-amber-500/5 text-center\">",
+                 "target": Array [
+                   ".mt-6",
+                 ],
+               },
+               Object {
+                 "html": "<div class=\"min-h-dvh bg-background text-slate-200\">",
+                 "target": Array [
+                   ".min-h-dvh",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 2.19 (foreground color: #45556c, background color: #1b1e28, font size: 7.8pt (10.4px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<p class=\"text-[0.65rem] text-slate-600 mt-2\">Less than $0.63/day · Cancel anytime</p>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".text-slate-600",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#1b2336",
+               "contrastRatio": 3.28,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#62748e",
+               "fontSize": "7.8pt (10.4px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3.28 (foreground color: #62748e, background color: #1b2336, font size: 7.8pt (10.4px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<div class=\"mt-10 p-5 rounded-lg border border-ds-border/30 bg-ds-muted/50\">",
+                 "target": Array [
+                   ".bg-ds-muted\\/50",
+                 ],
+               },
+               Object {
+                 "html": "<div class=\"min-h-dvh bg-background text-slate-200\">",
+                 "target": Array [
+                   ".min-h-dvh",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.28 (foreground color: #62748e, background color: #1b2336, font size: 7.8pt (10.4px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<span class=\"text-[0.65rem] text-slate-500 block mb-1\">README badge</span>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".block",
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
+                 "html": "<div class=\"min-h-dvh bg-background text-slate-200\">",
+                 "target": Array [
+                   ".min-h-dvh",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.74 (foreground color: #62748e, background color: #0f172a, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<footer class=\"text-center text-slate-500 text-xs mt-10 pt-6 border-t border-ds-border/30\">Generated by <a href=\"https://git.exposed\" class=\"text-slate-500 hover:text-slate-300\" target=\"_blank\" rel=\"noopener\">git.exposed</a> - Is your code exposed?</footer>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           "footer",
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
+                 "html": "<div class=\"min-h-dvh bg-background text-slate-200\">",
+                 "target": Array [
+                   ".min-h-dvh",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.74 (foreground color: #62748e, background color: #0f172a, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<a href=\"https://git.exposed\" class=\"text-slate-500 hover:text-slate-300\" target=\"_blank\" rel=\"noopener\">git.exposed</a>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".hover\\:text-slate-300",
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
    - banner [ref=e12]:
      - heading "git.exposed" [level=1] [ref=e13]
      - generic [ref=e14]:
        - generic [ref=e17]: F
        - generic [ref=e18]: 0/100
        - generic [ref=e19]: Vibe Safety Score
      - paragraph [ref=e20]: 6 issues found · Scanned 2026-04-03
      - paragraph [ref=e21]: expressjs/express
    - generic [ref=e22]:
      - generic [ref=e23]: 3 critical
      - generic [ref=e24]: 2 high
      - generic [ref=e25]: 1 medium
    - generic [ref=e26]:
      - generic [ref=e27]:
        - generic [ref=e28]:
          - generic [ref=e29]: critical
          - strong [ref=e30]: Possible SQL injection
        - paragraph [ref=e31]: SQL built with string concatenation allows injection. Use parameterized queries.
        - generic [ref=e32]: examples/route-map/index.js:51
      - generic [ref=e33]:
        - generic [ref=e34]:
          - generic [ref=e35]: critical
          - strong [ref=e36]: Dangerous eval() usage
        - paragraph [ref=e37]: eval() executes arbitrary code. An attacker can inject malicious JavaScript.
        - generic [ref=e38]: test/res.redirect.js:115
      - generic [ref=e39]:
        - generic [ref=e40]:
          - generic [ref=e41]: high
          - strong [ref=e42]: Unsafe innerHTML assignment
        - paragraph [ref=e43]: innerHTML with user input enables XSS attacks. Use textContent instead.
        - generic [ref=e44]: test/res.redirect.js:115
      - generic [ref=e45]:
        - generic [ref=e46]:
          - generic [ref=e47]: critical
          - strong [ref=e48]: Dangerous eval() usage
        - paragraph [ref=e49]: eval() executes arbitrary code. An attacker can inject malicious JavaScript.
        - generic [ref=e50]: test/res.redirect.js:116
      - generic [ref=e51]:
        - generic [ref=e52]:
          - generic [ref=e53]: high
          - strong [ref=e54]: Unsafe innerHTML assignment
        - paragraph [ref=e55]: innerHTML with user input enables XSS attacks. Use textContent instead.
        - generic [ref=e56]: test/res.redirect.js:116
      - generic [ref=e57]:
        - generic [ref=e58]:
          - generic [ref=e59]: medium
          - strong [ref=e60]: No lockfile found
        - paragraph [ref=e61]: "No package-lock.json or similar. Builds are not reproducible. Run `npm install` to generate one."
        - generic [ref=e62]: package.json
    - generic [ref=e63]:
      - paragraph [ref=e64]: Fix all 6 issues with one click
      - paragraph [ref=e65]: AI generates a PR with fixes - you just review and merge.
      - link "Upgrade to Pro - $19/mo" [ref=e66] [cursor=pointer]:
        - /url: /api/checkout
      - paragraph [ref=e67]: Less than $0.63/day · Cancel anytime
    - generic [ref=e68]:
      - generic [ref=e69]:
        - generic [ref=e70]: Share this report
        - button "Copy link" [ref=e71] [cursor=pointer]
      - generic [ref=e73]:
        - generic [ref=e74]: README badge
        - generic [ref=e75]:
          - code [ref=e76]: "![git.exposed](https://git.exposed/badge/expressjs/express)"
          - button "Copy" [ref=e77] [cursor=pointer]
    - link "Scan another repo →" [ref=e79] [cursor=pointer]:
      - /url: /
    - contentinfo [ref=e80]:
      - text: Generated by
      - link "git.exposed" [ref=e81] [cursor=pointer]:
        - /url: https://git.exposed
      - text: "- Is your code exposed?"
  - alert [ref=e82]
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
  16 |     expect(critical).toEqual([]);
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
> 30 |     expect(critical).toEqual([]);
     |                      ^ Error: expect(received).toEqual(expected) // deep equality
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