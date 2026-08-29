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
