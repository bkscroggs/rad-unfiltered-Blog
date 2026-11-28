# Design System & UI Specification: Radiology Unfiltered

This document outlines the visual identity, design tokens, layout architecture, and component standards for **Radiology Unfiltered** (hosted at `https://bkscroggs.github.io/rad-unfiltered-Blog/`). It is intended as a design reference and prompt context for styling and UI generation tools such as Google Stitch.

---

## 1. Brand Identity & Design Philosophy

### 1.1 Core Mission
*Radiology Unfiltered* is an independent radiology news, educational commentary, and modality analysis publication founded by Bryan Scroggs (20-year hospital CT technologist). Its purpose is to bridge the gap between polished vendor marketing and floor-level clinical reality.

### 1.2 Aesthetic DNA
- **Theme**: PACS-inspired clinical editorial glassmorphism.
- **Atmosphere**: Deep, focused, calm, high-contrast readability evoking diagnostic reading rooms and modern clinical workstations.
- **Anti-AI Slop Principles**:
  - No candy pill badges or rainbow tags on static metadata.
  - Metadata is rendered as clean unboxed inline text separated by subtle typographic dots (`·`).
  - No thick left accent stripes (`border-l-4`).
  - Pull quotes feature top and bottom hairline borders with generous vertical breathing room.
  - Strict adherence to real clinical terminology, transparent sources, and persistent medical disclaimers.

---

## 2. Color Palette & Surface Tokens

### 2.1 Dark Mode (Primary Visual Identity)
| Token / Element | Value / Class | Description |
| :--- | :--- | :--- |
| **Canvas Background** | `linear-gradient(to bottom, #081221, #01060f)` | Deep navy-to-midnight vertical gradient, fixed background |
| **Glass Surface (Cards / Modals)** | `rgba(13, 25, 45, 0.65)` to `rgba(13, 25, 45, 0.85)` | Translucent deep slate-navy with `backdrop-blur-md` or `backdrop-blur-xl` |
| **Header Surface** | `rgba(8, 18, 33, 0.85)` (`#081221/85`) | Sticky frosted glass top bar with `backdrop-blur-xl` |
| **Footer Surface** | `transparent` | Allows the bottom midnight `#01060f` gradient to bleed through |
| **Hairline Borders** | `rgba(51, 65, 85, 0.8)` (`border-slate-800/80` or `border-slate-700/80`) | Delicate 1px slate divider lines |
| **Primary Text (Headings / Body)** | `#F4F4F5` / `#E4E4E7` (zinc-100 / zinc-200) | High-contrast off-white ink |
| **Secondary / Muted Text** | `#94A3B8` / `#64748B` (slate-400 / slate-500) | Timestamps, metadata, captions, colophon |
| **Brand Accent (Lapis Blue)** | `#60A5FA` / `#93C5FD` (blue-400 / blue-300) | Category kickers, active tabs, links, progress bar |
| **Selection Highlight** | `rgba(96, 165, 250, 0.2)` / `#93C5FD` | Custom text highlight color |
| **Status Accents** | Emerald `#34D399` (Read), Amber `#FCD34D` (Sun), Rose `#F87171` (Delete) | Semantic feedback indicators |

### 2.2 Light Mode (Editorial Archival Paper)
| Token / Element | Value / Class | Description |
| :--- | :--- | :--- |
| **Canvas Background** | `#FAFAFA` (zinc-50) | Crisp gallery-white surface |
| **Glass Surface** | `rgba(255, 255, 255, 0.8)` (`bg-white/80`) | Frosted white with subtle blur |
| **Header Surface** | `rgba(250, 250, 250, 0.9)` (`bg-[#FAFAFA]/90`) | Frosted sticky header |
| **Hairline Borders** | `rgba(228, 228, 231, 0.8)` (`border-zinc-200/80`) | Crisp hairline dividers |
| **Primary Text** | `#0A0A0A` (zinc-950) | Deep ink black |
| **Secondary / Muted Text** | `#52525B` / `#71717A` (zinc-600 / zinc-500) | Subtle typographic metadata |
| **Brand Accent** | `#1E3A8A` (blue-900) | Bold deep lapis for active states and kickers |
| **Selection Highlight** | `rgba(30, 58, 138, 0.15)` / `#1E3A8A` | Light-mode selection |

---

## 3. Typography Hierarchy

### 3.1 Font Families
- **Display & Headings**: `Playfair Display`, Georgia, Cambria, serif (`--font-serif`)
  - Expressive, authoritative, editorial serifs with natural `text-wrap: balance`.
- **Interface & Body Prose**: `Plus Jakarta Sans`, system-ui, sans-serif (`--font-sans`)
  - Crisp neo-grotesque sans-serif with high x-height for comfortable screen reading.
- **Data, Code, & Metrics**: `JetBrains Mono`, monospace (`--font-mono`)
  - Used for tabular figures (`tabular-nums`), keyboard badges (`⌘K`), code snippets, and timestamps.

### 3.2 Type Scale & Metrics
- **Hero Title**: `clamp(2rem, 3.5vw, 2.85rem)` (32px–46px), line-height `1.1`, font-weight `600`.
- **Article H1 Title**: `clamp(2rem, 4vw, 3.25rem)` (32px–52px), line-height `1.1`, font-weight `600`.
- **Section Headings (H2)**: `clamp(1.5rem, 2.5vw, 2rem)` (24px–32px), line-height `1.25`, font-weight `600`.
- **Sub-headings (H3)**: `1.3125rem` (21px), line-height `1.35`, font-weight `600`.
- **Body Prose (Standard)**: `1.0625rem` (17px), line-height `1.8`, max measure `68ch`.
  - **Small option**: `0.96875rem` (15.5px), line-height `1.75`.
  - **Large option**: `1.1875rem` (19px), line-height `1.85`.
- **Metadata / Eyebrow**: `0.75rem` (12px), uppercase, tracking `0.12em`–`0.14em`, unboxed text.

---

## 4. Layout Architecture & Grid Structure

- **Desktop Container**: Centered container with `max-w-[1200px]`, horizontal padding `px-4 sm:px-6 lg:px-8`.
- **Header**: Height `h-14 sm:h-16`, sticky top (`top-0 z-40`). 3-zone contract:
  1. *Zone 1*: Single-line serif wordmark `Radiology Unfiltered`.
  2. *Zone 2*: 4–5 single-line nav links with hover underlines and active underline indicator.
  3. *Zone 3*: Theme toggle (desktop) and mobile drawer menu button (mobile).
  - *Reading Depth Progress Bar*: 2px bar immediately beneath the header tracking article scroll percentage.

### 4.1 Bento Hero Grid (Homepage)
A 12-column asymmetric grid:
- **Left 7 Columns (Lead Story)**:
  - Large 16:9 cover image with subtle hover scale (`scale-[1.02]`).
  - Unboxed metadata: `Featured · Category · Date · Reading Time · [Read Status]`.
  - Large serif title with hover color transition.
  - 2–3 line summary deck.
  - Action footer: "Read Article" button + bookmark icon button.
- **Right 5 Columns (Vertical Stack)**:
  - **Author Spotlight Card**: Editor's note from Bryan Scroggs, highlighting 20 years of hospital CT experience, editorial mission, and link to introductory essay.
  - **Modality Index Card**: 2-column pill-less grid showing live article counts per modality (`CT & Spectral`, `MRI`, `Mammography`, `X-Ray`, `Ultrasound`, `Radiology AI`) with quick-filter click handlers.

### 4.2 Discovery & Filter Toolbar
- **Interactive Search Input**: Instant filter input + quick `⌘K` badge trigger.
- **Saved Reading List Button**: Shows live bookmark badge count `Saved (n)`.
- **Modality Segmented Bar**: Single-line category tabs with active contrast state.
- **Sort Selector**: Native select dropdown for `Newest First`, `Oldest First`, `Shortest Read`, `Longest Read`.

### 4.3 Article Reading Canvas
- **Top Utility Strip**: "Back to All Articles" button + glassmorphic **Reader Comfort Bar** containing:
  - Font size toggles (`S / M / L`).
  - Column measure toggle (`Standard: 68ch` vs `Wide: 82ch`).
  - Bookmark button (`Saved` state).
  - Quick `⌘K` search shortcut.
- **Hero Image**: 16:9 banner with a floating "Inspect Figure" zoom button.
- **Content Grid (12 Columns)**:
  - **Left 8–9 Columns**: Markdown article body (`max-w-[68ch]` or `max-w-[82ch]`).
  - **Right 3–4 Columns (Sticky Sidebar)**:
    - **In This Article**: Scroll-spy table of contents linking directly to H2/H3 anchors and highlighting the active reading position.
    - **Colophon**: Section, publish date, word count, estimated reading time, and "Copy Article Link" button.
- **Post-Article Sections**:
  - Medical Disclaimer callout.
  - Hyperlinked primary literature sources.
  - "Continue Reading" 2-column card grid.

---

## 5. Rich Content Elements & Formatting

### 5.1 Drop Caps
Opening paragraph features an editorial drop cap:
```css
.editorial-prose > p:first-of-type::first-letter {
  font-family: var(--font-serif);
  font-size: 3.35rem;
  font-weight: 600;
  line-height: 0.85;
  float: left;
  margin-right: 0.75rem;
  margin-top: 0.35rem;
}
```

### 5.2 Pull Quotes
Centered or full-width quotes with horizontal hairlines rather than thick vertical stripes:
```css
.editorial-prose blockquote {
  margin: 2.25rem 0;
  padding: 1.5rem 0;
  border-top: 1px solid rgba(228, 228, 231, 0.9);
  border-bottom: 1px solid rgba(228, 228, 231, 0.9);
  font-family: var(--font-serif);
  font-style: italic;
  font-size: clamp(1.25rem, 2vw, 1.5rem);
}
```

### 5.3 Clinical Callout Boxes
Used for "Clinical Takeaways", "Editorial Standards", and "Archival Notes":
- Rounded 12px corners (`rounded-xl`).
- 1px hairline border with frosted backdrop blur.
- Small uppercase bold kicker in lapis blue (`callout-title`).

### 5.4 Data Tables
- Enclosed in a rounded scrollable wrapper (`table-wrap`).
- Numbers set with tabular numerals (`tabular-nums`).
- Alternating header contrast with muted uppercase column titles.

### 5.5 Figures & Responsive Media
- Figures: Bordered container with italic serif caption underneath (`figcaption`).
- Inline Zoom: Hoverable "Zoom" button opening the full-screen lightbox.
- Video: 16:9 aspect-ratio container with rounded corners and clean black backdrop.

---

## 6. Overlays & Modals

1. **Command-K Instant Search Modal (`⌘K` / `Ctrl+K`)**:
   - Centered spotlight overlay with backdrop blur.
   - Live search input matching titles, summaries, categories, and section headings.
   - Keyboard navigation (`↑`, `↓`, `Enter`, `Esc`).
   - Quick-jump modality chips.
2. **Reading List Drawer**:
   - Slide-over right drawer on desktop and mobile.
   - Lists all saved articles with read/unread status badges and remove buttons.
   - "Clear All" utility.
3. **Mobile Navigation Drawer**:
   - Slide-over right drawer triggered by hamburger menu on `< md` screens.
   - Instant access to Search, Saved Articles, Theme switch, and all modality categories.
4. **Figure Lightbox Modal**:
   - Darkened full-screen modal with "Fit View" and "1.75× Zoom" toggles.
   - Escape key dismiss and click-outside dismissal.

---

## 7. Mandatory Clinical & Legal Constraints

1. **Medical Disclaimer Notice**:
   Every post and the site-wide footer MUST contain the exact Medical Disclaimer:
   > "Medical Disclaimer: The content published on Radiology Unfiltered is provided strictly for informational and educational purposes only and represents an aggregation and commentary on news from various radiology headlines and industry sources. The author assumes no personal or professional responsibility or liability for any medical, diagnostic, or clinical applications resulting from the use or interpretation of information on this site. Nothing on this blog constitutes medical advice, clinical guidance, or a substitute for professional medical judgment, institutional protocols, or official manufacturer and regulatory documentation."
2. **Sources Section**:
   Every clinical article concludes with a hyperlinked sources section linking to primary radiology authorities (RSNA, ACR, FDA, Radiopaedia, NICE, etc.).
3. **Subpath & Static Architecture**:
   - Assets and images must resolve relative to `import.meta.env.BASE_URL`.
   - Routing must remain hash-based (`#/post/:slug`) so static hosts (GitHub Pages) never return 404s on page refresh.
