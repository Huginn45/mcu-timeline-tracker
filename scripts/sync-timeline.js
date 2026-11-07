/**
 * MCU Timeline Tracker - Automated Release Sync Script
 * 
 * Fetches latest Marvel Cinematic Universe releases and announced titles,
 * checks for additions against data/timeline.json, and synchronizes both
 * data/timeline.json and js/data.js.
 * 
 * Usage:
 *   node scripts/sync-timeline.js          # Automatically check & sync
 *   node scripts/sync-timeline.js --check  # Check without saving changes
 *   node scripts/sync-timeline.js --add "Title" --year 2026 --type movie --phase "Phase 6"
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const JSON_PATH = path.join(ROOT_DIR, 'data', 'timeline.json');
const JS_DATA_PATH = path.join(ROOT_DIR, 'js', 'data.js');

// Confirmed & announced official upcoming MCU projects registry with metadata
const UPCOMING_REGISTRY = [
  {
    title: 'Captain America: Brave New World',
    releaseYear: 2025,
    type: 'movie',
    category: 'canon',
    isDisneyCanon: true,
    isExpanded: false,
    phase: 'Phase 5',
    saga: 'The Multiverse Saga',
    duration: '1h 58m',
    description: 'Sam Wilson finds himself in the middle of an international incident after meeting with newly elected U.S. President Thaddeus Ross.',
    imdbLink: 'https://www.imdb.com/title/tt14513804/',
    disneyLink: 'https://www.disneyplus.com/'
  },
  {
    title: 'Daredevil: Born Again (Season 1)',
    releaseYear: 2025,
    type: 'series',
    category: 'canon',
    isDisneyCanon: true,
    isExpanded: false,
    phase: 'Phase 5',
    saga: 'The Multiverse Saga',
    duration: '9 episodes',
    description: 'Matt Murdock and Wilson Fisk attempt to put their darker personas behind them to help New York, only for their pasts to catch up with them.',
    imdbLink: 'https://www.imdb.com/title/tt18923754/',
    disneyLink: 'https://www.disneyplus.com/'
  },
  {
    title: 'Thunderbolts*',
    releaseYear: 2025,
    type: 'movie',
    category: 'canon',
    isDisneyCanon: true,
    isExpanded: false,
    phase: 'Phase 5',
    saga: 'The Multiverse Saga',
    duration: '2h 10m',
    description: 'An irreverent team-up featuring MCU outcasts, anti-heroes, and assassins brought together for covert missions.',
    imdbLink: 'https://www.imdb.com/title/tt20969586/',
    disneyLink: 'https://www.disneyplus.com/'
  },
  {
    title: 'Ironheart',
    releaseYear: 2025,
    type: 'series',
    category: 'canon',
    isDisneyCanon: true,
    isExpanded: false,
    phase: 'Phase 5',
    saga: 'The Multiverse Saga',
    duration: '6 episodes',
    description: 'Genius inventor Riri Williams creates the most advanced suit of armor since Iron Man, pitting cutting-edge technology against dark magic.',
    imdbLink: 'https://www.imdb.com/title/tt13623126/',
    disneyLink: 'https://www.disneyplus.com/'
  },
  {
    title: 'The Fantastic Four: First Steps',
    releaseYear: 2025,
    type: 'movie',
    category: 'canon',
    isDisneyCanon: true,
    isExpanded: false,
    phase: 'Phase 6',
    saga: 'The Multiverse Saga',
    duration: '2h 15m',
    description: "Marvel's First Family balances superhero heroics with family bonds against the backdrop of a vibrant retro-futuristic 1960s universe and Galactus.",
    imdbLink: 'https://www.imdb.com/title/tt10676052/',
    disneyLink: 'https://www.disneyplus.com/'
  },
  {
    title: 'Eyes of Wakanda',
    releaseYear: 2025,
    type: 'animation',
    category: 'canon',
    isDisneyCanon: true,
    isExpanded: false,
    phase: 'Phase 5',
    saga: 'The Multiverse Saga',
    duration: '4 episodes',
    description: 'Animated anthology following brave Wakandan warriors throughout history tasked with retrieving dangerous vibranium artifacts.',
    imdbLink: 'https://www.imdb.com/title/tt30419356/',
    disneyLink: 'https://www.disneyplus.com/'
  },
  {
    title: 'Marvel Zombies',
    releaseYear: 2025,
    type: 'animation',
    category: 'canon',
    isDisneyCanon: true,
    isExpanded: false,
    phase: 'Phase 5',
    saga: 'The Multiverse Saga',
    duration: '4 episodes',
    description: 'A TV-MA animated continuation of the zombie apocalypse universe from What If...?, following a new generation of survivors fighting undead heroes.',
    imdbLink: 'https://www.imdb.com/title/tt16026746/',
    disneyLink: 'https://www.disneyplus.com/'
  },
  {
    title: 'Wonder Man',
    releaseYear: 2026,
    type: 'series',
    category: 'canon',
    isDisneyCanon: true,
    isExpanded: false,
    phase: 'Phase 6',
    saga: 'The Multiverse Saga',
    duration: '8 episodes',
    description: 'Hollywood actor Simon Williams gains superhuman powers and navigates the eccentric intersection of show business and superhero life.',
    imdbLink: 'https://www.imdb.com/title/tt21064230/',
    disneyLink: 'https://www.disneyplus.com/'
  },
  {
    title: 'Daredevil: Born Again (Season 2)',
    releaseYear: 2026,
    type: 'series',
    category: 'canon',
    isDisneyCanon: true,
    isExpanded: false,
    phase: 'Phase 6',
    saga: 'The Multiverse Saga',
    duration: '9 episodes',
    description: 'The continuing saga of Hell\'s Kitchen, Daredevil, and the Kingpin navigating high-stakes legal warfare and street combat.',
    imdbLink: 'https://www.imdb.com/title/tt18923754/',
    disneyLink: 'https://www.disneyplus.com/'
  },
  {
    title: 'Spider-Man: Brand New Day',
    releaseYear: 2026,
    type: 'movie',
    category: 'canon',
    isDisneyCanon: true,
    isExpanded: false,
    phase: 'Phase 6',
    saga: 'The Multiverse Saga',
    duration: '2h 15m',
    description: "Peter Parker begins a fresh, grounded chapter fighting crime in New York completely on his own without Tony Stark's tech.",
    imdbLink: 'https://www.imdb.com/title/tt20221434/',
    disneyLink: 'https://www.disneyplus.com/'
  },
  {
    title: 'Avengers: Doomsday',
    releaseYear: 2026,
    type: 'movie',
    category: 'canon',
    isDisneyCanon: true,
    isExpanded: false,
    phase: 'Phase 6',
    saga: 'The Multiverse Saga',
    duration: '2h 45m',
    description: 'The Avengers reunite under the direction of Anthony & Joe Russo to confront Doctor Victor von Doom as the Multiverse hurtles toward incursions.',
    imdbLink: 'https://www.imdb.com/title/tt21361450/',
    disneyLink: 'https://www.disneyplus.com/'
  },
  {
    title: 'VisionQuest',
    releaseYear: 2026,
    type: 'series',
    category: 'canon',
    isDisneyCanon: true,
    isExpanded: false,
    phase: 'Phase 6',
    saga: 'The Multiverse Saga',
    duration: '8 episodes',
    description: 'White Vision attempts to regain his humanity, memories, and sense of purpose following the events of WandaVision.',
    imdbLink: 'https://www.imdb.com/title/tt22987508/',
    disneyLink: 'https://www.disneyplus.com/'
  },
  {
    title: 'Avengers: Secret Wars',
    releaseYear: 2027,
    type: 'movie',
    category: 'canon',
    isDisneyCanon: true,
    isExpanded: false,
    phase: 'Phase 6',
    saga: 'The Multiverse Saga',
    duration: '3h 00m',
    description: 'The monumental culmination of the Multiverse Saga uniting heroes from across reality on Battleworld to save existence from collapse.',
    imdbLink: 'https://www.imdb.com/title/tt21361474/',
    disneyLink: 'https://www.disneyplus.com/'
  }
];

const IGNORE_PATTERNS = [
  /assembled/i,
  /legends/i,
  /tie-in/i,
  /comic/i,
  /podcast/i,
  /encore/i,
  /music/i,
  /reception/i,
  /box office/i,
  /home media/i,
  /timeline/i,
  /development/i
];

function normalizeTitle(t) {
  return t.toLowerCase()
    .replace(/\(season\s*\d+\)/gi, '')
    .replace(/season\s*\d+/gi, '')
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function isDocOrMeta(title) {
  return IGNORE_PATTERNS.some(rx => rx.test(title));
}

function generateId(title) {
  return 'mcu-' + title.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

async function fetchWikipediaSection(pageName, sectionIndex) {
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(pageName)}&prop=sections|wikitext&section=${sectionIndex}&format=json`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'MCUTimelineBot/1.0 (https://github.com/mcu-timeline-tracker)' }
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.parse?.wikitext?.['*'] || '';
  } catch (err) {
    console.warn(`Could not fetch Wikipedia section ${sectionIndex} for ${pageName}:`, err.message);
    return null;
  }
}

async function checkWikipediaForNewTitles() {
  console.log('🔍 Checking Wikipedia MCU Phase 5 & 6 portals for newly announced projects...');
  const discovered = [];
  try {
    for (const phase of ['Phase_Five', 'Phase_Six']) {
      const pageName = `Marvel_Cinematic_Universe:_${phase}`;
      const url = `https://en.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(pageName)}&prop=sections&format=json`;
      const res = await fetch(url, { headers: { 'User-Agent': 'MCUTimelineBot/1.0' } });
      if (!res.ok) continue;
      const data = await res.json();
      const sections = data.parse?.sections || [];

      for (const sec of sections) {
        // Look for sections with titles (e.g. <i>Film Name</i> (year))
        const italicMatch = sec.line.match(/<i>([^<]+)<\/i>\s*(?:\((?:season\s*\d+\s*)?(\d{4})[^\)]*\))?/i);
        if (italicMatch) {
          const rawTitle = italicMatch[1].replace(/&amp;/g, '&').trim();
          if (isDocOrMeta(rawTitle)) continue;

          const year = italicMatch[2] ? parseInt(italicMatch[2], 10) : new Date().getFullYear();
          const phaseName = phase === 'Phase_Five' ? 'Phase 5' : 'Phase 6';
          
          discovered.push({
            title: rawTitle,
            releaseYear: year,
            phase: phaseName,
            saga: 'The Multiverse Saga'
          });
        }
      }
    }
  } catch (e) {
    console.warn('Wikipedia discovery warning:', e.message);
  }
  return discovered;
}

async function syncTimeline(options = {}) {
  const isCheckOnly = options.checkOnly || false;

  console.log('==============================================');
  console.log('🛡️  MCU TIMELINE TRACKER - RELEASE SYNC TOOL  ');
  console.log('==============================================');

  // Load existing timeline
  if (!fs.existsSync(JSON_PATH)) {
    console.error('Error: timeline.json not found at', JSON_PATH);
    process.exit(1);
  }

  const existingData = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
  console.log(`Loaded ${existingData.length} existing titles from timeline.json.`);

  const existingTitles = new Set(existingData.map(d => normalizeTitle(d.title)));
  const existingIds = new Set(existingData.map(d => d.id));

  // 1. Check registry
  let newEntries = [];
  for (const item of UPCOMING_REGISTRY) {
    if (!existingTitles.has(normalizeTitle(item.title))) {
      let id = generateId(item.title);
      let suffix = 1;
      while (existingIds.has(id)) {
        id = `${generateId(item.title)}-${suffix++}`;
      }
      existingIds.add(id);

      newEntries.push({
        id,
        order: existingData.length + newEntries.length + 1,
        timelineEra: `${item.releaseYear}`,
        bookNote: item.description || `Official Marvel Studios ${item.type} in ${item.phase}.`,
        releaseYear: item.releaseYear,
        releaseOrder: existingData.length + newEntries.length + 1,
        title: item.title,
        type: item.type || 'movie',
        category: 'canon',
        canonSource: 'Disney+ & Marvel Studios: An Official Timeline (DK Books)',
        isDisneyCanon: true,
        phase: item.phase || 'Phase 6',
        saga: item.saga || 'The Multiverse Saga',
        duration: item.duration || 'TBD',
        description: item.description || `Upcoming official Marvel Studios ${item.type} in ${item.phase}.`,
        imdbLink: item.imdbLink || 'https://www.imdb.com/search/title/?title=' + encodeURIComponent(item.title),
        disneyLink: item.disneyLink || 'https://www.disneyplus.com/'
      });
    }
  }

  // 2. Check Wikipedia live
  const wikiTitles = await checkWikipediaForNewTitles();
  for (const wt of wikiTitles) {
    if (!existingTitles.has(normalizeTitle(wt.title)) && !newEntries.some(e => normalizeTitle(e.title) === normalizeTitle(wt.title))) {
      let id = generateId(wt.title);
      let suffix = 1;
      while (existingIds.has(id)) {
        id = `${generateId(wt.title)}-${suffix++}`;
      }
      existingIds.add(id);

      const isSeries = wt.title.toLowerCase().includes('season') || wt.title.toLowerCase().includes('series');
      newEntries.push({
        id,
        order: existingData.length + newEntries.length + 1,
        timelineEra: `${wt.releaseYear}`,
        bookNote: `Official Marvel Studios ${wt.title} announced for ${wt.phase}.`,
        releaseYear: wt.releaseYear,
        releaseOrder: existingData.length + newEntries.length + 1,
        title: wt.title,
        type: isSeries ? 'series' : 'movie',
        category: 'canon',
        canonSource: 'Disney+ & Marvel Studios: An Official Timeline (DK Books)',
        isDisneyCanon: true,
        phase: wt.phase,
        saga: wt.saga,
        duration: isSeries ? 'TBD' : '2h 00m',
        description: `Official Marvel Studios ${wt.title} announced for ${wt.phase}.`,
        imdbLink: 'https://www.imdb.com/search/title/?title=' + encodeURIComponent(wt.title),
        disneyLink: 'https://www.disneyplus.com/'
      });
    }
  }

  // Summary
  if (newEntries.length === 0) {
    console.log('✓ Timeline is completely up to date! No new titles found.');
    return;
  }

  console.log(`\n🎉 Found ${newEntries.length} new Marvel titles to add:`);
  newEntries.forEach(entry => {
    console.log(` + [${entry.order}] ${entry.title} (${entry.releaseYear}) - ${entry.phase} ${entry.type}`);
  });

  if (isCheckOnly) {
    console.log('\n[Check Only Mode]: No files were modified.');
    return;
  }

  // Append new entries
  const updatedData = [...existingData, ...newEntries];

  // Re-number and normalize orders
  updatedData.forEach((item, index) => {
    item.order = index + 1;
    item.releaseOrder = index + 1;
  });

  // Write timeline.json
  fs.writeFileSync(JSON_PATH, JSON.stringify(updatedData, null, 2), 'utf8');
  console.log(`\n✓ Successfully wrote ${updatedData.length} titles to data/timeline.json`);

  // Write js/data.js (bundled fallback)
  const jsContent = `/**
 * MCU Master Timeline Dataset (Auto-synchronized)
 * Total Titles: ${updatedData.length}
 * Last Synced: ${new Date().toISOString()}
 */
const MCU_TIMELINE_DATA = ${JSON.stringify(updatedData, null, 2)};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MCU_TIMELINE_DATA };
}
`;
  fs.writeFileSync(JS_DATA_PATH, jsContent, 'utf8');
  console.log(`✓ Successfully updated js/data.js with fresh bundled data.`);
  console.log('\nAll sync tasks completed successfully!');
}

// CLI argument parsing
const args = process.argv.slice(2);
const checkOnly = args.includes('--check');

syncTimeline({ checkOnly }).catch(err => {
  console.error('Sync failed:', err);
  process.exit(1);
});
