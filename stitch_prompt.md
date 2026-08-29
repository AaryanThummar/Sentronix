# Stitch Prompt for Sentronix UI

Please generate the frontend React UI for "Sentronix", an AI-Driven Purple Team Cybersecurity and Threat Management Platform. 

The application should have a main dashboard built using a **Bento Grid** layout, adhering strictly to the light color theme provided.

## Core Application Structure
- **Sidebar Layout**: A fixed left sidebar for navigation containing the Sentronix logo (a shield icon) and the following links: Dashboard, Scans & Workers, Reports, Settings. Include a small user profile section at the bottom (Admin User).
- **Main Content Area**: A scrollable main area where the dashboard components will live. The background should use `--color-bg`.

## The Dashboard (Bento Grid)
Implement a classic asymmetric Bento grid using CSS Grid. The cards should use `--color-surface` with `--radius-card` and `--border-width` borders (no drop shadows).

The grid should contain the following tiles (feel free to adjust column/row spans to make it look like a sleek asymmetric bento grid):

1. **Security Posture Overview (Spans 2 columns)**
   - A high-level metric showing the overall platform risk score.
   - Use the violet accent (`--color-accent`) for the main metric graph or progress ring.

2. **Offensive Operations (Red Team)**
   - Display a count of "Critical Findings" and "Active Exploits".
   - **Crucial:** Use the `--color-danger` semantic color for icons, graphs, or badges in this tile.

3. **Defensive Operations (Blue Team)**
   - Display "Files Analyzed" and "Blocked Threats".
   - **Crucial:** Use the `--color-success` semantic color for icons, graphs, or badges in this tile.

4. **Recent AI-Correlated Findings (Large tile, spans full width or multiple columns/rows)**
   - A list/table of recent vulnerabilities that maps runtime DAST exploits to SAST code paths.
   - Columns: Severity (Badge), Vulnerability Title, Tool Used, Location, and an AI Patch action link.
   - Severity badges must use the semantic text colors over a light tinted background (e.g., `--color-danger` text on a light red background).

5. **Active Scanners Status**
   - A small card showing the status of Celery workers (Semgrep, YARA, OWASP ZAP).
   - Use green status indicators (pills/badges).

## Styling and Theme Constraints
- You **MUST** use CSS custom properties for all colors, borders, and backgrounds based on the provided theme token list. Do not use hardcoded hex values in the components.
- Surfaces must be white (`--color-surface`) against an off-white background (`--color-bg`).
- The accent color (`--color-accent`) should be used very sparingly (e.g., just for the active state of the sidebar link and primary Call-To-Action buttons).
- Use `lucide-react` for all iconography. 
- Ensure internal padding for all bento cards is generous (around 1rem - 1.25rem).
