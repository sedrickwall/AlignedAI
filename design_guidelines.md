# Design Guidelines for Aligned App

## Design Approach
**Utility-Focused Design System** - This productivity/wellness app prioritizes clarity, calm, and function over decorative elements. The design draws from minimalist productivity tools like Notion and Linear, emphasizing readability and peaceful focus.

## Core Design Principles
1. **Calm Clarity** - Soft, neutral palette creates a peaceful environment for reflection and planning
2. **Structured Flexibility** - Clear visual hierarchy guides users through daily and weekly planning
3. **Faith-Centered** - Design respects the spiritual nature of the app with thoughtful spacing and gentle aesthetics

## Typography System

**Font Family:** System font stack (system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif)

**Hierarchy:**
- Page Title: 2xl, semibold, tight tracking (e.g., "Aligned")
- Section Headers: lg, semibold (e.g., "Today's Alignment")
- Card Titles: sm-base, medium weight
- Body Text: sm, regular
- Labels/Metadata: xs, uppercase with wide tracking, muted color
- Scripture/Quotes: sm, italic

## Color Palette

**Background & Structure:**
- Primary Background: Stone beige (#F5F5F3) - warm, calming neutral
- Card Background: Pure white (#FFFFFF)
- Subtle Borders: Soft stone (#E4E2DD)

**Interactive & Accent:**
- Primary Accent: Royal blue (#3B5BDB) - trust, faith, stability
- Accent Background: Light blue tint (#EDF1FF)
- Text Primary: Deep slate (#1F2933)
- Text Muted: Medium gray (#6B7280)

**Status Colors:**
- Success: Green (#16A34A)
- Warning: Amber (#F59E0B)

## Layout System

**Spacing Units:** Consistent use of Tailwind units: 2, 3, 4, 5, 6, 8 for padding/margins

**Container Structure:**
- Max width: 6xl (1280px)
- Horizontal padding: 4 (mobile), 6 (tablet), 8 (desktop)
- Vertical page padding: 6

**Grid Layouts:**
- Mobile: Single column, full width
- Desktop: 2-column grid with 6-unit gap
- Card internal spacing: 5 units padding

## Component Library

### Cards
- Background: White with subtle shadow (0 10px 30px rgba(15,23,42,0.05))
- Border: 1px solid soft stone
- Border radius: 2xl (1.5rem) - generous, friendly rounding
- Padding: 5 units
- Vertical spacing between cards: 4 units

### Buttons
**Primary Variant:**
- Background: Accent blue
- Text: White
- Padding: 4 horizontal, 2 vertical
- Border radius: Full (pill shape)
- Font: sm, medium weight
- Focus ring: 2px accent blue with 2px offset

**Ghost Variant:**
- Background: Transparent
- Border: 1px soft stone
- Text: Primary text color
- Padding: 3 horizontal, 1.5 vertical
- Hover state: Soft stone background

All buttons include 2-unit gap for icon/text spacing

### Progress Bars
- Container: Soft stone background at 60% opacity, rounded full, height 1.5
- Fill: Accent blue, rounded full, width based on percentage
- Display current/target ratio in muted text (xs)

### Input Groups
- Energy level selectors: Horizontal button group with ghost buttons
- Minimal visual weight, text-based options (Low/Normal/High)

## Page Sections

### Header
- Flexbox layout: title left, metadata right
- Title with subtitle stacked vertically
- Minimal decoration, maximum clarity

### Daily Dashboard (2-column grid)
**Left Column:**
1. Verse of the Day card - uppercase label + italic scripture quote
2. Today's Alignment card - energy selector + Big 3 priorities list

**Right Column:**
1. Time-Blocked Schedule card - time slots with em dash separator
2. Reset prompt card - horizontal layout with description + CTA button

### Weekly Overview (2-column grid)
**Left Column:**
- Pillar tracking with 6 life areas
- Each row: pillar name (fixed width) + progress bar + ratio display

**Right Column:**
- Weekly focus narrative paragraph
- Top 5 bulleted list with bullet points

## Accessibility & Interaction

- Focus rings on all interactive elements: 2px accent blue with 2px offset
- Clear hover states on buttons (background darkening for primary, background filling for ghost)
- Semantic HTML structure with proper heading hierarchy
- High contrast ratios between text and backgrounds
- Touch-friendly sizing for mobile (minimum 44px tap targets)

## Responsive Behavior

**Mobile (< 1024px):**
- Stack all 2-column grids to single column
- Maintain card padding and spacing ratios
- Full-width buttons where appropriate

**Desktop (≥ 1024px):**
- 2-column layouts active
- Fixed pillar name widths in progress bars
- Right-aligned metadata in header

## Content Strategy

**Daily Focus:**
- Single verse keeps spiritual grounding without overwhelm
- "Big 3" limits priorities to essential tasks
- Time blocks shown as simple list, not complex calendar

**Weekly Rhythm:**
- 6 life pillars provide holistic view without fragmentation
- Progress bars give quick visual feedback
- Top 5 list maintains achievable scope

## Visual Rhythm

- Consistent vertical spacing creates scanning rhythm
- Card elevation (subtle shadows) provides gentle depth without distraction
- Rounded corners (2xl) throughout create cohesive, friendly aesthetic
- Limited color palette prevents visual noise

## Images

No hero images or decorative imagery. The design intentionally avoids visual distraction to maintain focus on planning and reflection. All visual interest comes from layout, typography, and the soft color palette.