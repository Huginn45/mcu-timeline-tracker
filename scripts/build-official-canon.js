const fs = require('fs');
const path = require('path');

const projectDir = 'c:\\Users\\wesle\\OneDrive\\Documents\\MCU';
const jsonPath = path.join(projectDir, 'data', 'timeline.json');
const jsPath = path.join(projectDir, 'js', 'data.js');

const rawData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// Filter only official canon (remove the 20 expanded non-canon items)
const canonItems = rawData.filter(d => d.isDisneyCanon && d.category !== 'expanded' && !d.isExpanded);

// Sort strictly by official Disney+ & Official Timeline Book order
canonItems.sort((a, b) => a.disneyOrder - b.disneyOrder);

// Accurate in-universe timeline eras and milestones codified by
// Marvel Studios: The Marvel Cinematic Universe - An Official Timeline (DK Books)
const TIMELINE_METADATA = {
  'eyes-of-wakanda': {
    era: 'Ancient History – Modern Era',
    bookNote: 'Hatut Zeraze retrieving vibranium across centuries',
    type: 'animation'
  },
  'captain-america-first-avenger': {
    era: 'Spring 1942 – March 1945',
    bookNote: 'Steve Rogers transformed; battles Red Skull & Hydra',
    type: 'movie'
  },
  'oneshot-agent-carter': {
    era: '1946',
    bookNote: 'Peggy Carter retrieves the Zodiac key; invited to run S.H.I.E.L.D.',
    type: 'oneshot'
  },
  'captain-marvel': {
    era: 'Summer 1995',
    bookNote: 'Carol Danvers discovers true past with Nick Fury & the Skrulls',
    type: 'movie'
  },
  'iron-man-1': {
    era: 'Spring 2008',
    bookNote: 'Tony Stark builds the Mark I in Afghanistan and announces "I am Iron Man"',
    type: 'movie'
  },
  'iron-man-2': {
    era: 'Spring 2010',
    bookNote: "Fury's Big Week begins; Stark Expo, Ivan Vanko, and Black Widow undercover",
    type: 'movie'
  },
  'the-incredible-hulk': {
    era: 'Spring 2010',
    bookNote: "Fury's Big Week; Bruce Banner battles the Abomination in Harlem",
    type: 'movie'
  },
  'oneshot-thors-hammer': {
    era: 'Spring 2010',
    bookNote: "Fury's Big Week; Agent Coulson en route to Puente Antiguo, New Mexico",
    type: 'oneshot'
  },
  'thor-1': {
    era: 'Spring 2010',
    bookNote: "Fury's Big Week; Thor banished to Earth; discovers Mjolnir and worthiness",
    type: 'movie'
  },
  'oneshot-the-consultant': {
    era: 'Spring 2010',
    bookNote: "Fury's Big Week aftermath; Coulson and Sitwell recruit Tony Stark as consultant",
    type: 'oneshot'
  },
  'the-avengers': {
    era: 'Spring 2012',
    bookNote: 'The Battle of New York; Earth\'s Mightiest Heroes assemble against Loki and the Chitauri',
    type: 'movie'
  },
  'oneshot-item-47': {
    era: 'Spring 2012',
    bookNote: 'Battle of New York aftermath; Bennie and Claire salvage a discarded Chitauri rifle',
    type: 'oneshot'
  },
  'thor-the-dark-world': {
    era: 'Fall 2013',
    bookNote: 'Convergence of Nine Realms; Malekith attempts to use the Aether (Reality Stone)',
    type: 'movie'
  },
  'iron-man-3': {
    era: 'Christmas 2012 / Early 2013',
    bookNote: 'Tony struggles with PTSD following Battle of New York; confronts Aldrich Killian',
    type: 'movie'
  },
  'oneshot-all-hail-the-king': {
    era: 'Spring 2014',
    bookNote: 'Seagate Prison; Trevor Slattery broken out by agents of the real Ten Rings',
    type: 'oneshot'
  },
  'captain-america-winter-soldier': {
    era: 'Spring 2014',
    bookNote: 'Hydra infiltration of S.H.I.E.L.D. exposed; return of Bucky Barnes as Winter Soldier',
    type: 'movie'
  },
  'guardians-of-the-galaxy-1': {
    era: 'Summer 2014',
    bookNote: 'Peter Quill, Gamora, Drax, Rocket, and Groot unite to protect the Power Stone',
    type: 'movie'
  },
  'guardians-of-the-galaxy-2': {
    era: 'Summer 2014 (Months Later)',
    bookNote: 'Peter Quill meets his father Ego the Living Planet; Yondu\'s sacrifice',
    type: 'movie'
  },
  'i-am-groot-s1': {
    era: 'Summer 2014',
    bookNote: 'Baby Groot\'s early mischievous adventures following the battle of Xandar',
    type: 'animation'
  },
  'i-am-groot-s2': {
    era: 'Summer 2014',
    bookNote: 'Baby Groot explores space, sensory powers, and snowman building',
    type: 'animation'
  },
  'daredevil-s1': {
    era: 'Fall 2014 – Early 2015',
    bookNote: 'Matt Murdock defends Hell\'s Kitchen following the devastation of the Battle of New York',
    type: 'series'
  },
  'jessica-jones-s1': {
    era: 'Spring 2015',
    bookNote: 'Jessica Jones confronts Kilgrave and overcomes traumatic past in New York',
    type: 'series'
  },
  'avengers-age-of-ultron': {
    era: 'Spring 2015',
    bookNote: 'The Battle of Sokovia; birth of Vision and rise of artificial intelligence Ultron',
    type: 'movie'
  },
  'ant-man-1': {
    era: 'Summer 2015',
    bookNote: 'Scott Lang recruited by Hank Pym to prevent Darren Cross selling Yellowjacket tech',
    type: 'movie'
  },
  'daredevil-s2': {
    era: 'Fall 2015 – Early 2016',
    bookNote: 'Arrival of Frank Castle (The Punisher) and Elektra Natchios battling the Hand',
    type: 'series'
  },
  'luke-cage-s1': {
    era: 'Late 2015 – Early 2016',
    bookNote: 'Luke Cage protects Harlem from Cornell "Cottonmouth" Stokes and Diamondback',
    type: 'series'
  },
  'iron-fist-s1': {
    era: 'Spring 2016',
    bookNote: 'Danny Rand returns to New York after 15 years in K\'un-Lun to reclaim Rand Enterprises',
    type: 'series'
  },
  'the-defenders': {
    era: 'Spring 2016',
    bookNote: 'Daredevil, Jessica Jones, Luke Cage, and Iron Fist team up against the Hand under Midland Circle',
    type: 'series'
  },
  'captain-america-civil-war': {
    era: 'Spring 2016',
    bookNote: 'The Sokovia Accords fracture the Avengers; debut of Spider-Man and Black Panther',
    type: 'movie'
  },
  'black-widow': {
    era: 'Summer 2016 (Right After Civil War)',
    bookNote: 'Official timeline placement: Natasha Romanoff on the run from Ross; dismantles the Red Room',
    type: 'movie'
  },
  'black-panther-1': {
    era: 'Summer 2016 (Weeks After Civil War)',
    bookNote: 'T\'Challa crowned King of Wakanda following King T\'Chaka\'s death; confronts Killmonger',
    type: 'movie'
  },
  'spider-man-homecoming': {
    era: 'Fall 2016 (Official 8-Yr Error Resolution)',
    bookNote: 'Official Timeline Book confirms Fall 2016 placement, officially correcting the "8 years later" card',
    type: 'movie'
  },
  'the-punisher-s1': {
    era: 'Fall 2016',
    bookNote: 'Frank Castle discovers a deeper government conspiracy behind the murder of his family',
    type: 'series'
  },
  'doctor-strange-1': {
    era: 'Fall 2016 – Early 2017',
    bookNote: 'Stephen Strange crashes car in early 2016, trains in Kamar-Taj, defeats Dormammu in 2017',
    type: 'movie'
  },
  'jessica-jones-s2': {
    era: 'Spring 2017',
    bookNote: 'Jessica investigates IGH origins and discovers her mother Alisa is still alive',
    type: 'series'
  },
  'luke-cage-s2': {
    era: 'Summer 2017',
    bookNote: 'Luke Cage confronts Bushmaster and wrestles with his celebrity status in Harlem',
    type: 'series'
  },
  'iron-fist-s2': {
    era: 'Summer 2017',
    bookNote: 'Danny Rand defends Chinatown; Davos attempts to steal the Iron Fist power',
    type: 'series'
  },
  'daredevil-s3': {
    era: 'Fall 2017',
    bookNote: 'Matt Murdock recovers in Saint Jerome\'s; Wilson Fisk manipulates Agent Poindexter (Bullseye)',
    type: 'series'
  },
  'thor-ragnarok': {
    era: 'Fall 2017',
    bookNote: 'Destruction of Asgard to defeat Hela; Thor, Loki, and Hulk lead refugee vessel toward Earth',
    type: 'movie'
  },
  'the-punisher-s2': {
    era: 'Spring 2018',
    bookNote: 'Frank Castle protects teenage Amy Bendix and faces Billy Russo (Jigsaw) in New York',
    type: 'series'
  },
  'jessica-jones-s3': {
    era: 'Spring 2018',
    bookNote: 'Jessica faces psychopathic serial killer Gregory Sallinger; Trish Walker becomes Hellcat',
    type: 'series'
  },
  'ant-man-and-the-wasp': {
    era: 'Spring 2018 (Concurrent with Infinity War)',
    bookNote: 'Scott, Hope, and Hank rescue Janet van Dyne; post-credit snap traps Scott in Quantum Realm',
    type: 'movie'
  },
  'avengers-infinity-war': {
    era: 'Spring 2018',
    bookNote: 'Thanos collects all six Infinity Stones and wipes out half of all life across the universe ("The Snap")',
    type: 'movie'
  },
  'avengers-endgame': {
    era: 'Spring 2018 / Fall 2023 ("The Blip" Ends)',
    bookNote: 'The 5-year gap (2018–2023); Time Heist; Tony Stark snaps away Thanos; half of universe restored',
    type: 'movie'
  },
  'loki-s1': {
    era: 'Outside Linear Time (TVA)',
    bookNote: 'Variant Loki from 2012 branch captured by TVA; He Who Remains killed, freeing Sacred Timeline',
    type: 'series'
  },
  'what-if-s1': {
    era: 'Multiverse / Alternate Realities',
    bookNote: 'The Watcher observes alternate pivotal branches across the blossoming multiverse',
    type: 'animation'
  },
  'marvel-zombies': {
    era: 'Multiverse (Zombie Apocalypse)',
    bookNote: 'Continuation of the What If...? zombie outbreak featuring surviving new generation heroes',
    type: 'animation'
  },
  'wandavision': {
    era: 'Fall 2023 (+3 Weeks Post-Endgame)',
    bookNote: 'Official Timeline Book confirms: Wanda creates the Westview Hex three weeks after the Blip',
    type: 'series'
  },
  'shang-chi': {
    era: 'Spring 2024 (Qingming Festival)',
    bookNote: 'Shang-Chi confronts his father Wenwu and the Ten Rings in Macau and Ta Lo',
    type: 'movie'
  },
  'the-falcon-and-the-winter-soldier': {
    era: 'Spring 2024 (+6 Months Post-Endgame)',
    bookNote: 'Official Timeline Book confirms: Sam Wilson confronts Flag Smashers and accepts Captain America shield',
    type: 'series'
  },
  'spider-man-far-from-home': {
    era: 'Summer 2024 (End of School Year)',
    bookNote: 'Peter Parker on European trip battles Mysterio; identity leaked to the world by J. Jonah Jameson',
    type: 'movie'
  },
  'eternals': {
    era: 'Fall 2024',
    bookNote: 'The return of half the universe triggers the Emergence of Tiamut in the Indian Ocean',
    type: 'movie'
  },
  'spider-man-no-way-home': {
    era: 'Summer 2024 – November 2024',
    bookNote: 'Spans from Mysterio leak to winter holiday memory-wipe spell; three Spider-Men unite',
    type: 'movie'
  },
  'doctor-strange-multiverse-of-madness': {
    era: 'Fall 2024 (November)',
    bookNote: 'Strange protects America Chavez across Earth-838 from the corrupted Scarlet Witch',
    type: 'movie'
  },
  'hawkeye': {
    era: 'Christmas 2024 (December)',
    bookNote: 'Clint Barton partners with Kate Bishop in snowy NYC; Wilson Fisk confirmed active',
    type: 'series'
  },
  'moon-knight': {
    era: 'Spring 2025',
    bookNote: 'Steven Grant and Marc Spector stop Arthur Harrow from resurrecting Ammit in Egypt',
    type: 'series'
  },
  'black-panther-wakanda-forever': {
    era: 'Spring 2025',
    bookNote: 'One year after King T\'Challa\'s death; Shuri becomes Black Panther to negotiate peace with Namor',
    type: 'movie'
  },
  'echo': {
    era: 'May 2025',
    bookNote: 'Maya Lopez returns to Tamaha, Oklahoma; confronts Kingpin and taps into ancestral Choctaw powers',
    type: 'series'
  },
  'she-hulk': {
    era: 'Summer 2025',
    bookNote: 'Jennifer Walters gains Hulk powers; navigates superhuman law division and Intelligencia',
    type: 'series'
  },
  'ms-marvel': {
    era: 'Fall 2025',
    bookNote: 'Kamala Khan unlocks mutant bangle powers; stops Clandestines and defends Jersey City',
    type: 'series'
  },
  'thor-love-and-thunder': {
    era: 'Fall 2025',
    bookNote: 'Thor and Mighty Thor (Jane Foster) stop Gorr the God Butcher reaching Eternity',
    type: 'movie'
  },
  'ironheart': {
    era: 'Late 2025',
    bookNote: 'Riri Williams balances MIT innovations against Parker Robbins (The Hood) and dark magic',
    type: 'series'
  },
  'werewolf-by-night': {
    era: 'Late 2025',
    bookNote: 'Jack Russell and Elsa Bloodstone participate in monster hunt at Bloodstone Manor',
    type: 'special'
  },
  'gotg-holiday-special': {
    era: 'December 2025',
    bookNote: 'Mantis and Drax kidnap Kevin Bacon to cheer up Peter Quill on Knowhere for Christmas',
    type: 'special'
  },
  'ant-man-quantumania': {
    era: 'Early 2026',
    bookNote: 'The Ant-Family pulled into Quantum Realm; battle against Kang the Conqueror',
    type: 'movie'
  },
  'guardians-of-the-galaxy-3': {
    era: '2026',
    bookNote: 'Guardians battle the High Evolutionary to save Rocket Raccoon; team disbands on good terms',
    type: 'movie'
  },
  'secret-invasion': {
    era: 'Fall 2026',
    bookNote: 'Nick Fury uncovers Gravik\'s rogue Skrull faction infiltrating highest world governments',
    type: 'series'
  },
  'the-marvels': {
    era: 'Fall 2026',
    bookNote: 'Carol Danvers, Monica Rambeau, and Kamala Khan become power-entangled against Dar-Benn',
    type: 'movie'
  },
  'loki-s2': {
    era: 'Outside Linear Time / End of Time',
    bookNote: 'Loki masters timeslipping, replaces the Temporal Loom, and becomes God of Stories holding the multiverse',
    type: 'series'
  },
  'what-if-s2': {
    era: 'Multiverse / Alternate Realities',
    bookNote: 'Captain Carter and the Watcher traverse Kahhori\'s universe and Supreme Strange\'s Sanctum',
    type: 'animation'
  },
  'deadpool-and-wolverine': {
    era: '2024 / The Void / Earth-10005 Anchor',
    bookNote: 'Wade Wilson and Logan team up in the Void to save the Merc\'s home universe from Cassandra Nova',
    type: 'movie'
  },
  'agatha-all-along': {
    era: 'Fall 2026',
    bookNote: 'Agatha Harkness forms a makeshift coven with Billy Maximoff to walk the Witches\' Road',
    type: 'series'
  },
  'what-if-s3': {
    era: 'Multiverse / Alternate Realities',
    bookNote: 'The climactic final animated season of the Multiverse anthology',
    type: 'animation'
  },
  'daredevil-born-again-s1': {
    era: '2026',
    bookNote: 'Matt Murdock and Mayor Wilson Fisk navigate power struggles in a revitalized New York',
    type: 'series'
  },
  'captain-america-brave-new-world': {
    era: '2026',
    bookNote: 'President Thaddeus Ross recruits Sam Wilson amidst an international adamantium conspiracy',
    type: 'movie'
  },
  'thunderbolts': {
    era: '2026',
    bookNote: 'Yelena Belova, Bucky Barnes, and MCU antiheroes unite on dangerous black-ops missions',
    type: 'movie'
  },
  'fantastic-four-first-steps': {
    era: 'Alternate 1960s Retro-Future',
    bookNote: 'Marvel\'s First Family faces Galactus and the Silver Surfer in an alternate timeline',
    type: 'movie'
  },
  'wonder-man': {
    era: '2026',
    bookNote: 'Simon Williams navigates Hollywood stardom and ion-charged superhuman abilities',
    type: 'series'
  },
  'daredevil-born-again-s2': {
    era: '2026 / 2027',
    bookNote: 'Continuation of the street-level war for the soul of New York City',
    type: 'series'
  },
  'punisher-one-last-kill': {
    era: '2026 / 2027',
    bookNote: 'Frank Castle carries out one final high-stakes mission',
    type: 'special'
  },
  'mcu-avengers-doomsday': {
    era: 'Multiverse Collisions / Incursions Era',
    bookNote: 'Earth\'s mightiest heroes assemble under the Russo Brothers to confront Doctor Doom',
    type: 'movie'
  },
  'mcu-visionquest': {
    era: '2026 / 2027',
    bookNote: 'White Vision attempts to regain his lost memories and humanity',
    type: 'series'
  },
  'mcu-avengers-secret-wars': {
    era: 'Battleworld / Culmination of Multiverse Saga',
    bookNote: 'The ultimate climax of the Multiverse Saga uniting heroes across realities',
    type: 'movie'
  },
  'mcu-your-friendly-neighborhood-spider-man': {
    era: 'Multiverse / Early High School Years',
    bookNote: 'Peter Parker\'s origin under an alternate mentor in an early high school animated timeline',
    type: 'animation'
  }
};

const updatedCanon = canonItems.map((item, index) => {
  const meta = TIMELINE_METADATA[item.id] || {};
  return {
    id: item.id,
    order: index + 1,
    timelineEra: meta.era || `${item.releaseYear}`,
    bookNote: meta.bookNote || item.description,
    releaseYear: item.releaseYear,
    releaseOrder: index + 1,
    title: item.title,
    type: meta.type || item.type,
    category: 'canon',
    canonSource: 'Disney+ & Marvel Studios: An Official Timeline (DK Books)',
    isDisneyCanon: true,
    phase: item.phase,
    saga: item.saga,
    duration: item.duration,
    description: item.description,
    imdbLink: item.imdbLink,
    disneyLink: item.disneyLink
  };
});

// Write to timeline.json
fs.writeFileSync(jsonPath, JSON.stringify(updatedCanon, null, 2), 'utf8');
console.log(`✓ Successfully updated ${jsonPath} with ${updatedCanon.length} official canon titles.`);

// Write to js/data.js
const jsContent = `/**
 * Official Marvel Studios Cinematic Universe Timeline Dataset
 * Codified by Disney+ & Marvel Studios: An Official Timeline (DK Books)
 * Total Official Canon Titles: ${updatedCanon.length}
 * Last Updated: ${new Date().toISOString()}
 */
const MCU_TIMELINE_DATA = ${JSON.stringify(updatedCanon, null, 2)};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MCU_TIMELINE_DATA };
}
`;
fs.writeFileSync(jsPath, jsContent, 'utf8');
console.log(`✓ Successfully updated ${jsPath}.`);
