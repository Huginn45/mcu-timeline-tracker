# The Sacred Timeline | Official MCU Marathon Tracker ⏳🛡️

An interactive, glassmorphic web application that tracks and checks off your Marvel Cinematic Universe marathon viewing progress using the **Official Marvel Studios Sacred Timeline** codified by **[Marvel Studios: The Marvel Cinematic Universe - An Official Timeline](https://en.wikipedia.org/wiki/Marvel_Studios:_The_Marvel_Cinematic_Universe:_An_Official_Timeline)** (DK Books) and **[Disney+ Official Timeline Order](https://www.marvel.com/articles/movies/mcu-timeline-order-disney-plus)**.

---

## 🌌 Official Marvel Studios Canon (84 Verified Titles)

All non-canon external filler and disputed TV projects (e.g. *Agents of S.H.I.E.L.D.*, *Runaways*, *Cloak & Dagger*, *Inhumans*, *Helstrom*) have been removed, leaving **100% verified Marvel Studios Sacred Timeline canon**:

- **Official In-Universe Eras & Book Notes**: Every title includes the exact historical milestone and year codified in the official DK reference book (e.g., *Spring 1942–1945*, *1995*, *Spring 2010 Fury's Big Week*, *Spring 2012 Battle of New York*, *Fall 2016 Spider-Man: Homecoming error resolution*, *Fall 2023 Post-Endgame*, *Outside Linear Time*).
- **Films & TV Series Categorization**: Cleanly separated into **Feature Films** (39) and **TV Series & Specials** (45).
- **Direct Links for Every Entry**: Both **IMDb title page** (`https://www.imdb.com/title/...`) and **Disney+ streaming link** are provided for each title.

---

## 🎛️ Streamlined Sidebar Navigation

The sidebar navigation has been streamlined for fast marathon browsing:
- **⊞ All Timeline (84)**: Complete chronologically ordered Marvel Studios Sacred Timeline.
- **🎬 Films (39)**: Filter instantly to feature theatrical films.
- **📺 TV Series (45)**: Filter to Disney+ series, animation, Special Presentations, and One-Shots.

---

## ✨ Features

- **The Sacred Timeline Design System & Dual Themes**:
  - **⏳ Temporal Dark Mode**: Deep walnut obsidian (`#0d0b08`) background, glowing amber-orange (`#f97316`) temporal thread accents, brass borders, and translucent frosted cards.
  - **📜 Archival Light Mode**: Warm mid-century archival paper (`#f6f1e8`), manila records styling, and deep mahogany borders.
  - One-click theme toggle in the sidebar with instant `localStorage` persistence.
- **Fixed Sidebar Navigation & Breadcrumbs**: Left navigation panel with streamlined filters (`All Timeline`, `Films`, `TV Series`), plus tools and backup controls.
- **4 KPI Metric Cards**: Visual top row showing Total Watched progress percentage, Feature Films, TV Series & Specials, and Infinity vs. Multiverse Saga counters with colored icon bubbles.
- **"Up Next" Hero Banner**: Curved glass hero card highlighting the next unwatched MCU title in chronological order with quick-watch actions.
- **Recent Transactions-Style Timeline Table**: High-density table featuring colored avatar initial bubbles, in-universe era badges (`📖 Spring 1942 – 1945`), translucent status pills (`Completed` green vs. `Unwatched` amber/coral), 1–5 star ratings, and review modals.
- **Ratings & Notes Log**: Give 1–5 star ratings and keep personal watch dates or reviews in the notes modal.
- **Multi-Attribute Filters**: Filter by Type (Movies, Series, Animation, One-Shots, Specials), Phase (Phase 1–6), Saga, and Watched Status.
- **Sorting Options**:
  - Official Timeline Order (Disney+ & DK Books)
  - Release Premiere Order
  - Alphabetical (A to Z)
- **Dual Layout Modes**:
  - **Recent Transactions Table**: High-density checklist with avatar initials and status pills.
  - **Cards Grid**: Rich glass cards with badges, synopses, and action buttons.
- **Persistent Storage & Backup**:
  - Auto-saved in browser `localStorage`.
  - **Export JSON**: Download a timestamped backup of your progress, ratings, and notes.
  - **Import JSON**: Restore your progress anytime across devices.
  - **Print / PDF Friendly**: Clean print stylesheet (`@media print`) to print a paper checklist.
- **Realtime Automated Release Sync (GitHub Actions + In-App Sync)**:
  - Automated weekly cron job and manual 1-click trigger via GitHub Actions workflow (`.github/workflows/sync-timeline.yml`).
  - Automatically queries official MCU portals for newly announced films and series (Phase 5, Phase 6, upcoming Disney+ originals).
  - In-app **"Check for Updates 🔄"** button and live update banner with zero user data loss (all watched history, ratings, and notes remain 100% intact).
  - Dual data architecture: Dynamic JSON (`data/timeline.json`) + bundled offline fallback (`js/data.js`).
- **Zero Dependencies**: Pure HTML5, modern CSS glassmorphism, and ES6 JavaScript.

---

## ⚡ Automated Real-Time Updates

Whenever Marvel announces a new movie or TV series (e.g. at San Diego Comic-Con, D23, or via Disney+ press releases):

1. **Automated Weekly Sync**:
   The GitHub Actions workflow runs every Monday at 06:00 UTC (or whenever triggered manually via the GitHub Actions tab with the **"Run workflow"** button).
2. **Detection & Enrichment**:
   The sync tool ([`scripts/sync-timeline.js`](file:///c:/Users/wesle/OneDrive/Documents/MCU/scripts/sync-timeline.js)) checks for newly announced titles, enriches them with release year, phase, saga, duration, and streaming links, and commits the updated [`data/timeline.json`](file:///c:/Users/wesle/OneDrive/Documents/MCU/data/timeline.json) and [`js/data.js`](file:///c:/Users/wesle/OneDrive/Documents/MCU/js/data.js).
3. **In-App Realtime Reflection**:
   When visitors open the website, the app checks for new additions in the background:
   - Displays an in-app banner: `✨ X new Marvel releases added to timeline! [View New Titles]`.
   - Users can also click **"Check for Updates"** in the sidebar at any time.
   - User progress is mapped by unique title slugs, ensuring existing watch status, dates, and ratings are never erased.

### Manual CLI Commands:
```powershell
# Check for new releases without modifying files
npm.cmd run check

# Synchronize and write new releases to dataset
npm.cmd run sync
```

---

## 🚀 How to Run

### Method 1: Open Directly in Any Browser
Double-click `index.html` or drag and drop it into Chrome, Edge, Safari, or Firefox.

### Method 2: Run via Local Server (Recommended)
```powershell
npx serve .
# or
python -m http.server 8080
```
Then navigate to `http://localhost:8080`.

---

## 📁 Project Structure

```
MCU/
├── .github/
│   └── workflows/
│       └── sync-timeline.yml   # GitHub Actions scheduled weekly auto-updater
├── data/
│   └── timeline.json           # Dynamic master timeline JSON dataset
├── scripts/
│   └── sync-timeline.js        # Automated MCU release detection & sync tool
├── index.html                  # Single-page web app with GlassDash layout
├── css/
│   └── style.css               # GlassDash design system, dual themes, and animations
├── js/
│   ├── data.js                 # Bundled offline fallback dataset
│   └── app.js                  # State manager, realtime sync loader, filters, modals
├── package.json                # Project scripts (npm run sync, npm run check)
└── README.md                   # Documentation and guide
```

---

## 📜 Credits
- Official Disney+ Canon order from [Marvel.com's Official Viewing Guide](https://www.marvel.com/articles/movies/mcu-timeline-order-disney-plus).
- Expanded chronology reference from [IMDb list ls029032797](https://www.imdb.com/list/ls029032797/).
- Marvel characters, logos, and elements &copy; Marvel Characters, Inc. and The Walt Disney Company. IMDb &copy; IMDb.com, Inc.
