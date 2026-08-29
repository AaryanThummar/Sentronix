<!-- theme.md -->
# Sentronix Platform: Light Bento Theme

Implement a light color theme for our security platform (purple teaming product) using CSS custom properties, and apply it to our bento grid layout components.

## CSS Custom Properties

Add these tokens to `:root` (or the appropriate global stylesheet):

```css
:root {
  --color-bg: #F7F7F6;              /* page background */
  --color-surface: #FFFFFF;          /* card background */
  --color-surface-hover: #FAFAF9;    /* card hover/raised state */
  --color-border: #E3E1DC;           /* default card border */
  --color-border-strong: #D1CFC8;    /* emphasized divider */

  --color-accent: #4F46A3;           /* primary violet accent — buttons, links, active nav, brand elements */
  --color-accent-bg: #EEEDFE;        /* light accent fill for badges/pills */

  --color-text-primary: #2B2A33;
  --color-text-secondary: #6B6A72;
  --color-text-muted: #9B9AA0;

  --color-success: #0F6E56;          /* blue team / defense signals, detections */
  --color-warning: #854F0B;          /* medium-severity findings */
  --color-danger: #993C1D;           /* red team / offense signals, critical findings */

  --radius-card: 12px;
  --border-width: 0.5px;
}
```

## Requirements

1. **Variables Over Hardcoding**: Use CSS custom properties (variables), not hardcoded hex values, in all component styles so this can later be swapped for a dark theme via a `[data-theme="dark"]` selector.
2. **Accent Usage**: Apply `--color-accent` sparingly — one primary accent per view (main CTA, active nav item, key brand marks). Don't tint every card border or icon with it.
3. **Bento Grid Cards**: White surface (`--color-surface`) on off-white page (`--color-bg`), 0.5px border (`--color-border`), 12px border-radius, no box-shadow, generous internal padding (1rem–1.25rem).
4. **Semantic Colors**: Use `--color-success` for defensive/blue-team data (detections, coverage, blocked attempts) and `--color-danger` for offensive/red-team data (exploits, critical findings) — this is a deliberate semantic pairing, keep it consistent across all dashboard components.
5. **Text Accessibility on Badges**: Text on colored badge/pill backgrounds must use the corresponding darker text token (e.g. success text on a success-tinted background), never plain black or `--color-text-primary`.
6. **Bento Grid Layout**: Grid should use CSS Grid with variable column/row spans (some tiles span 2 columns or 2 rows) to create the classic bento asymmetric layout — not a uniform grid.
7. **Restrained Palette**: Keep the overall palette restrained: violet accent + gray/slate neutrals + red/green semantic pair only. No additional decorative colors.

*Apply this theme across the dashboard page and all bento grid components within the application.*


<!-- Design System -->
<!DOCTYPE html>

<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Sentronix - Purple Team AI Dashboard</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;600;800&amp;family=Inter:wght@400;500&amp;family=JetBrains+Mono:wght@400;500&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
          darkMode: "class",
          theme: {
            extend: {
              "colors": {
                      "primary": "#372d8a",
                      "surface-container-high": "#e8e8e7",
                      "tertiary-fixed": "#ffdcbd",
                      "on-secondary": "#ffffff",
                      "on-primary": "#ffffff",
                      "inverse-on-surface": "#f1f1f0",
                      "outline-variant": "#c8c4d3",
                      "on-error": "#ffffff",
                      "on-tertiary-fixed-variant": "#693c00",
                      "tertiary": "#5a3300",
                      "surface": "#FFFFFF",
                      "danger-offensive": "#993C1D",
                      "on-primary-fixed-variant": "#423995",
                      "error": "#ba1a1a",
                      "surface-tint": "#5a52af",
                      "warning-mid": "#854F0B",
                      "secondary-fixed-dim": "#c8c5d1",
                      "secondary": "#5f5d67",
                      "surface-container": "#eeeeed",
                      "inverse-surface": "#2f3130",
                      "background": "#f9f9f8",
                      "on-secondary-fixed-variant": "#47464f",
                      "surface-container-low": "#f3f4f3",
                      "border-strong": "#D1CFC8",
                      "on-tertiary-fixed": "#2c1600",
                      "on-primary-container": "#c7c1ff",
                      "on-secondary-fixed": "#1b1b23",
                      "surface-variant": "#e2e2e2",
                      "secondary-container": "#e2deea",
                      "on-error-container": "#93000a",
                      "outline": "#787583",
                      "error-container": "#ffdad6",
                      "surface-container-lowest": "#ffffff",
                      "primary-fixed": "#e4dfff",
                      "tertiary-fixed-dim": "#ffb86e",
                      "accent-soft": "#EEEDFE",
                      "on-tertiary-container": "#ffb970",
                      "on-surface-variant": "#474552",
                      "text-secondary": "#6B6A72",
                      "primary-container": "#4f46a3",
                      "surface-bright": "#f9f9f8",
                      "tertiary-container": "#7a4700",
                      "on-background": "#1a1c1c",
                      "surface-hover": "#FAFAF9",
                      "on-surface": "#1a1c1c",
                      "secondary-fixed": "#e5e1ed",
                      "success-defensive": "#0F6E56",
                      "text-muted": "#9B9AA0",
                      "primary-fixed-dim": "#c6c0ff",
                      "on-secondary-container": "#63616c",
                      "surface-dim": "#dadad9",
                      "inverse-primary": "#c6c0ff",
                      "border-subtle": "#E3E1DC",
                      "on-primary-fixed": "#150066",
                      "on-tertiary": "#ffffff",
                      "surface-container-highest": "#e2e2e2"
              },
              "borderRadius": {
                      "DEFAULT": "0.25rem",
                      "lg": "0.5rem",
                      "xl": "0.75rem",
                      "full": "9999px"
              },
              "spacing": {
                      "section-margin": "2rem",
                      "grid-gap": "1rem",
                      "card-padding": "1.25rem",
                      "stack-md": "1rem",
                      "stack-sm": "0.5rem"
              },
              "fontFamily": {
                      "headline-md": [
                              "Hanken Grotesk"
                      ],
                      "label-md": [
                              "JetBrains Mono"
                      ],
                      "body-md": [
                              "Inter"
                      ],
                      "headline-lg": [
                              "Hanken Grotesk"
                      ],
                      "body-lg": [
                              "Inter"
                      ],
                      "body-sm": [
                              "Inter"
                      ],
                      "label-sm": [
                              "JetBrains Mono"
                      ],
                      "headline-lg-mobile": [
                              "Hanken Grotesk"
                      ],
                      "headline-sm": [
                              "Hanken Grotesk"
                      ]
              },
              "fontSize": {
                      "headline-md": [
                              "24px",
                              {
                                      "lineHeight": "32px",
                                      "letterSpacing": "-0.01em",
                                      "fontWeight": "600"
                              }
                      ],
                      "label-md": [
                              "12px",
                              {
                                      "lineHeight": "16px",
                                      "letterSpacing": "0.02em",
                                      "fontWeight": "500"
                              }
                      ],
                      "body-md": [
                              "14px",
                              {
                                      "lineHeight": "20px",
                                      "fontWeight": "400"
                              }
                      ],
                      "headline-lg": [
                              "30px",
                              {
                                      "lineHeight": "36px",
                                      "letterSpacing": "-0.02em",
                                      "fontWeight": "600"
                              }
                      ],
                      "body-lg": [
                              "16px",
                              {
                                      "lineHeight": "24px",
                                      "fontWeight": "400"
                              }
                      ],
                      "body-sm": [
                              "12px",
                              {
                                      "lineHeight": "18px",
                                      "fontWeight": "400"
                              }
                      ],
                      "label-sm": [
                              "10px",
                              {
                                      "lineHeight": "14px",
                                      "letterSpacing": "0.04em",
                                      "fontWeight": "500"
                              }
                      ],
                      "headline-lg-mobile": [
                              "24px",
                              {
                                      "lineHeight": "30px",
                                      "fontWeight": "600"
                              }
                      ],
                      "headline-sm": [
                              "18px",
                              {
                                      "lineHeight": "24px",
                                      "fontWeight": "600"
                              }
                      ]
              }
      },
          },
        }
    </script>
<style>
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 1;
        }
        .bento-card {
            background-color: theme('colors.surface');
            border-radius: 12px;
            border: 0.5px solid theme('colors.outline-variant');
            padding: theme('spacing.card-padding');
        }
    </style>
</head>
<body class="bg-background text-on-background font-body-md min-h-screen flex antialiased">
<!-- SideNavBar -->
<nav class="hidden md:flex flex-col h-full py-6 px-4 bg-surface fixed left-0 top-0 h-screen w-64 border-r-[0.5px] border-outline-variant z-50">
<div class="mb-8 px-2 flex items-center gap-3">
<img alt="Sentronix Shield Logo" class="w-8 h-8 rounded" data-alt="A minimalist tech logo for a cybersecurity platform named Sentronix, utilizing a purple and white color scheme in a flat design style." src="https://lh3.googleusercontent.com/aida-public/AB6AXuC1tnaK25K9D3yROIOc40SHKFKlksQ7I6PdzXAZRZikJK7pwQxc-ZNGIgLhXhKK_jEVahP64qBDoz-Exr_HEfJahQkmSO78eVZKu29REr8eOXU0X7sViqgRGFz6C9ZnxOvHb1bBgV3_Bw39--amUGVKKi-GVjaRpPfxd2wX2G09L3KMUHsFdwKvM-YUGdd4EPYFwdcVB5JqQAwqMr21l4aj011CpFvhPz1agOjaM0jwf6OTo9nz5aSa"/>
<div>
<h1 class="font-headline-md text-headline-md font-bold text-primary tracking-tight">SENTRONIX</h1>
<p class="font-label-md text-label-md text-text-muted">Purple Team AI</p>
</div>
</div>
<button class="mb-8 w-full bg-primary-container text-on-primary py-2 px-4 rounded-lg font-label-md text-label-md flex items-center justify-center gap-2 hover:bg-surface-tint transition-colors">
<span class="material-symbols-outlined text-[18px]">add</span>
            New Scan
        </button>
<ul class="flex flex-col gap-1 w-full flex-grow">
<li>
<a class="flex items-center gap-3 px-3 py-2 rounded-lg text-primary font-bold border-r-2 border-primary bg-accent-soft hover:bg-surface-hover transition-colors duration-200 active:scale-[0.98] transition-transform" href="#">
<span class="material-symbols-outlined">dashboard</span>
<span class="font-label-md text-label-md">Dashboard</span>
</a>
</li>
<li>
<a class="flex items-center gap-3 px-3 py-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-hover transition-colors duration-200 active:scale-[0.98] transition-transform" href="#">
<span class="material-symbols-outlined">security</span>
<span class="font-label-md text-label-md">Scans &amp; Workers</span>
</a>
</li>
<li>
<a class="flex items-center gap-3 px-3 py-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-hover transition-colors duration-200 active:scale-[0.98] transition-transform" href="#">
<span class="material-symbols-outlined">description</span>
<span class="font-label-md text-label-md">Reports</span>
</a>
</li>
<li>
<a class="flex items-center gap-3 px-3 py-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-hover transition-colors duration-200 active:scale-[0.98] transition-transform" href="#">
<span class="material-symbols-outlined">settings</span>
<span class="font-label-md text-label-md">Settings</span>
</a>
</li>
</ul>
</nav>
<!-- Main Content Area -->
<div class="flex-1 flex flex-col md:ml-64 w-full">
<!-- TopAppBar -->
<header class="sticky top-0 z-40 w-full bg-surface/80 backdrop-blur-md border-b-[0.5px] border-outline-variant flex items-center justify-between px-8 h-16">
<div class="flex items-center gap-4 w-1/3">
<h2 class="font-headline-sm text-headline-sm font-bold text-primary md:hidden">Sentronix</h2>
<div class="hidden md:flex items-center border-[0.5px] border-outline-variant rounded-full px-3 py-1.5 bg-surface-bright focus-within:ring-2 focus-within:ring-primary/20 transition-all w-full max-w-sm">
<span class="material-symbols-outlined text-text-muted text-[18px]">search</span>
<input class="bg-transparent border-none focus:outline-none ml-2 text-body-md text-on-surface w-full" placeholder="Search telemetry..." type="text"/>
</div>
</div>
<div class="flex items-center gap-4">
<button class="text-on-surface-variant hover:text-primary transition-colors focus:ring-2 focus:ring-primary/20 rounded-full p-1">
<span class="material-symbols-outlined">notifications</span>
</button>
<button class="text-on-surface-variant hover:text-primary transition-colors focus:ring-2 focus:ring-primary/20 rounded-full p-1">
<span class="material-symbols-outlined">account_circle</span>
</button>
</div>
</header>
<!-- Dashboard Canvas -->
<main class="p-4 md:p-8 flex-1 overflow-y-auto">
<div class="max-w-7xl mx-auto space-y-grid-gap">
<!-- Page Header -->
<div class="flex justify-between items-end mb-6">
<div>
<h1 class="font-headline-lg text-headline-lg text-on-surface">Overview</h1>
<p class="font-body-md text-body-md text-text-muted mt-1">System status and recent telemetry.</p>
</div>
<div class="text-right">
<span class="font-label-md text-label-md text-text-secondary bg-surface-container-high px-2 py-1 rounded">Last updated: Just now</span>
</div>
</div>
<!-- Bento Grid Container -->
<div class="grid grid-cols-1 md:grid-cols-12 gap-grid-gap auto-rows-min">
<!-- 1. Security Posture (Spans 4 cols on desktop to fit better) -->
<div class="bento-card col-span-1 md:col-span-4 flex flex-col justify-between">
<div>
<h3 class="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2 mb-4">
<span class="material-symbols-outlined text-primary">donut_large</span>
                                Security Posture
                            </h3>
<p class="font-body-sm text-body-sm text-text-muted mb-4">Overall organizational risk score based on active findings and configuration.</p>
</div>
<div class="flex items-center justify-center py-4">
<!-- Circular Progress Simulation -->
<div class="relative w-32 h-32 flex items-center justify-center rounded-full border-8 border-surface-container">
<div class="absolute inset-0 rounded-full border-8 border-primary border-t-transparent border-r-transparent transform -rotate-45"></div>
<div class="text-center">
<span class="font-headline-lg text-headline-lg text-primary block leading-none">A-</span>
<span class="font-label-sm text-label-sm text-text-secondary">Low Risk</span>
</div>
</div>
</div>
</div>
<!-- 2. Offensive Operations (Spans 4 cols) -->
<div class="bento-card col-span-1 md:col-span-4 flex flex-col">
<h3 class="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2 mb-4">
<span class="material-symbols-outlined text-danger-offensive">swords</span>
                            Offensive Ops
                        </h3>
<div class="flex-1 flex flex-col justify-center space-y-4">
<div class="flex items-center justify-between p-3 rounded-lg bg-error-container/20 border border-error-container">
<div class="flex items-center gap-3">
<div class="p-2 bg-error-container rounded text-danger-offensive">
<span class="material-symbols-outlined text-[20px]">bug_report</span>
</div>
<div>
<p class="font-label-md text-label-md text-on-surface">Critical Findings</p>
<p class="font-body-sm text-body-sm text-text-muted">Awaiting triage</p>
</div>
</div>
<span class="font-headline-md text-headline-md text-danger-offensive">3</span>
</div>
<div class="flex items-center justify-between p-3 rounded-lg bg-surface-container-low border border-border-subtle">
<div class="flex items-center gap-3">
<div class="p-2 bg-surface-variant rounded text-text-secondary">
<span class="material-symbols-outlined text-[20px]">bolt</span>
</div>
<div>
<p class="font-label-md text-label-md text-on-surface">Active Exploits</p>
<p class="font-body-sm text-body-sm text-text-muted">Currently running</p>
</div>
</div>
<span class="font-headline-md text-headline-md text-on-surface">12</span>
</div>
</div>
</div>
<!-- 3. Defensive Operations (Spans 4 cols) -->
<div class="bento-card col-span-1 md:col-span-4 flex flex-col">
<h3 class="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2 mb-4">
<span class="material-symbols-outlined text-success-defensive">shield</span>
                            Defensive Ops
                        </h3>
<div class="flex-1 flex flex-col justify-center space-y-4">
<div class="flex items-center justify-between p-3 rounded-lg bg-success-defensive/10 border border-success-defensive/20">
<div class="flex items-center gap-3">
<div class="p-2 bg-success-defensive/20 rounded text-success-defensive">
<span class="material-symbols-outlined text-[20px]">gpp_good</span>
</div>
<div>
<p class="font-label-md text-label-md text-on-surface">Blocked Threats</p>
<p class="font-body-sm text-body-sm text-text-muted">Past 24 hours</p>
</div>
</div>
<span class="font-headline-md text-headline-md text-success-defensive">84</span>
</div>
<div class="flex items-center justify-between p-3 rounded-lg bg-surface-container-low border border-border-subtle">
<div class="flex items-center gap-3">
<div class="p-2 bg-surface-variant rounded text-text-secondary">
<span class="material-symbols-outlined text-[20px]">folder_open</span>
</div>
<div>
<p class="font-label-md text-label-md text-on-surface">Files Analyzed</p>
<p class="font-body-sm text-body-sm text-text-muted">Automated triage</p>
</div>
</div>
<span class="font-headline-md text-headline-md text-on-surface">1.2k</span>
</div>
</div>
</div>
<!-- 4. Recent Findings Table (Spans 12 cols) -->
<div class="bento-card col-span-1 md:col-span-8 overflow-hidden flex flex-col">
<div class="flex justify-between items-center mb-4">
<h3 class="font-headline-sm text-headline-sm text-on-surface">Recent AI-Correlated Findings</h3>
<button class="font-label-sm text-label-sm text-primary hover:underline">View All</button>
</div>
<div class="overflow-x-auto w-full">
<table class="w-full text-left border-collapse">
<thead>
<tr class="border-b-[0.5px] border-border-strong">
<th class="pb-2 font-label-sm text-label-sm text-text-muted font-medium w-24">Severity</th>
<th class="pb-2 font-label-sm text-label-sm text-text-muted font-medium">Title</th>
<th class="pb-2 font-label-sm text-label-sm text-text-muted font-medium">Tool</th>
<th class="pb-2 font-label-sm text-label-sm text-text-muted font-medium">Location</th>
<th class="pb-2 font-label-sm text-label-sm text-text-muted font-medium text-right">Action</th>
</tr>
</thead>
<tbody class="font-body-md text-body-md text-on-surface divide-y-[0.5px] divide-border-subtle">
<tr class="hover:bg-surface-hover transition-colors">
<td class="py-3">
<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-error-container text-danger-offensive">CRITICAL</span>
</td>
<td class="py-3 pr-4 truncate max-w-[200px]">Hardcoded AWS Credentials</td>
<td class="py-3 font-label-md text-label-md text-text-secondary">Semgrep</td>
<td class="py-3 font-label-md text-label-md text-text-secondary truncate max-w-[150px]">src/config/aws.js</td>
<td class="py-3 text-right">
<button class="font-label-md text-label-md text-primary hover:text-primary-container flex items-center justify-end gap-1 w-full">
<span class="material-symbols-outlined text-[16px]">auto_fix_high</span>
                                                AI Patch
                                            </button>
</td>
</tr>
<tr class="hover:bg-surface-hover transition-colors">
<td class="py-3">
<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-tertiary-fixed text-warning-mid">HIGH</span>
</td>
<td class="py-3 pr-4 truncate max-w-[200px]">SQL Injection Vulnerability</td>
<td class="py-3 font-label-md text-label-md text-text-secondary">ZAP</td>
<td class="py-3 font-label-md text-label-md text-text-secondary truncate max-w-[150px]">api/v1/users/search</td>
<td class="py-3 text-right">
<button class="font-label-md text-label-md text-primary hover:text-primary-container flex items-center justify-end gap-1 w-full">
<span class="material-symbols-outlined text-[16px]">auto_fix_high</span>
                                                AI Patch
                                            </button>
</td>
</tr>
<tr class="hover:bg-surface-hover transition-colors">
<td class="py-3">
<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-surface-variant text-text-secondary">INFO</span>
</td>
<td class="py-3 pr-4 truncate max-w-[200px]">Suspicious File Detected</td>
<td class="py-3 font-label-md text-label-md text-text-secondary">YARA</td>
<td class="py-3 font-label-md text-label-md text-text-secondary truncate max-w-[150px]">uploads/temp_script.sh</td>
<td class="py-3 text-right">
<button class="font-label-md text-label-md text-text-muted hover:text-on-surface flex items-center justify-end gap-1 w-full">
<span class="material-symbols-outlined text-[16px]">visibility</span>
                                                Review
                                            </button>
</td>
</tr>
</tbody>
</table>
</div>
</div>
<!-- 5. Active Scanners (Spans 4 cols) -->
<div class="bento-card col-span-1 md:col-span-4">
<h3 class="font-headline-sm text-headline-sm text-on-surface mb-4">Active Scanners</h3>
<div class="space-y-3">
<div class="flex items-center justify-between p-2 rounded hover:bg-surface-hover transition-colors">
<div class="flex items-center gap-3">
<span class="material-symbols-outlined text-text-secondary text-[20px]">code</span>
<span class="font-label-md text-label-md text-on-surface">Semgrep</span>
</div>
<span class="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-success-defensive/10 border border-success-defensive/20 font-label-sm text-label-sm text-success-defensive">
<span class="w-1.5 h-1.5 rounded-full bg-success-defensive"></span>
                                    Running
                                </span>
</div>
<div class="flex items-center justify-between p-2 rounded hover:bg-surface-hover transition-colors">
<div class="flex items-center gap-3">
<span class="material-symbols-outlined text-text-secondary text-[20px]">troubleshoot</span>
<span class="font-label-md text-label-md text-on-surface">YARA Rules</span>
</div>
<span class="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-success-defensive/10 border border-success-defensive/20 font-label-sm text-label-sm text-success-defensive">
<span class="w-1.5 h-1.5 rounded-full bg-success-defensive"></span>
                                    Running
                                </span>
</div>
<div class="flex items-center justify-between p-2 rounded hover:bg-surface-hover transition-colors">
<div class="flex items-center gap-3">
<span class="material-symbols-outlined text-text-secondary text-[20px]">radar</span>
<span class="font-label-md text-label-md text-on-surface">ZAP DAST</span>
</div>
<span class="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-surface-variant border border-border-subtle font-label-sm text-label-sm text-text-secondary">
<span class="w-1.5 h-1.5 rounded-full bg-text-muted"></span>
                                    Idle
                                </span>
</div>
</div>
</div>
</div>
</div>
</main>
</div>
</body></html>