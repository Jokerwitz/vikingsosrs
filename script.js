// Skills metrics list
const skills = [
  "overall", "attack", "defence", "strength", "hitpoints", "ranged", "prayer",
  "magic", "cooking", "woodcutting", "fletching", "fishing", "firemaking", 
  "crafting", "smithing", "mining", "herblore", "agility", "thieving", 
  "slayer", "farming", "runecrafting", "hunter", "construction"
];

// Bosses metrics list
const bosses = [
  'abyssal_sire', 'alchemical_hydra', 'amoxliatl', 'araxxor', 'artio', 'barrows_chests', 
  'bryophyta', 'callisto', 'calvarion', 'cerberus', 'chambers_of_xeric', 
  'chambers_of_xeric_challenge_mode', 'chaos_elemental', 'chaos_fanatic', 
  'commander_zilyana', 'corporeal_beast', 'crazy_archaeologist', 'dagannoth_prime', 
  'dagannoth_rex', 'dagannoth_supreme', 'deranged_archaeologist', 'duke_sucellus', 
  'general_graardor', 'giant_mole', 'grotesque_guardians', 'hespori', 'kalphite_queen', 
  'king_black_dragon', 'kraken', 'kreearra', 'kril_tsutsaroth', 'lunar_chests', 
  'mimic', 'nex', 'nightmare', 'phosanis_nightmare', 'obor', 'phantom_muspah', 
  'sarachnis', 'scorpia', 'scurrius', 'skotizo', 'sol_heredit', 'spindel', 
  'tempoross', 'the_gauntlet', 'the_corrupted_gauntlet', 'the_hueycoatl', 
  'the_leviathan', 'the_whisperer', 'theatre_of_blood', 'theatre_of_blood_hard_mode', 
  'thermonuclear_smoke_devil', 'tombs_of_amascut', 'tombs_of_amascut_expert', 
  'tzkal_zuk', 'tztok_jad', 'vardorvis', 'venenatis', 'vetion', 'vorkath', 
  'wintertodt', 'zalcano', 'zulrah'
];

// Activities metrics list
const activities = [
  'league_points', 'bounty_hunter_hunter', 'bounty_hunter_rogue', 'clue_scrolls_all', 
  'clue_scrolls_beginner', 'clue_scrolls_easy', 'clue_scrolls_medium', 'clue_scrolls_hard', 
  'clue_scrolls_elite', 'clue_scrolls_master', 'last_man_standing', 'pvp_arena', 
  'soul_wars_zeal', 'guardians_of_the_rift', 'colosseum_glory'
];

let loading = false;
let cancelLoading = false;

// Open modal when the "Load Highscores" button is clicked
const loadHighscoresBtn = document.getElementById('loadHighscoresBtn');
const dateModal = document.getElementById('dateModal');
const submitDateRange = document.getElementById('submitDateRange');
const closeModal = document.getElementsByClassName('close')[0];

// Show the modal when the button is clicked
loadHighscoresBtn.onclick = function() {
  dateModal.style.display = 'block';
}

// Close the modal
closeModal.onclick = function() {
  dateModal.style.display = 'none';
}

// Close the modal if the user clicks outside of it
window.onclick = function(event) {
  if (event.target == dateModal) {
    dateModal.style.display = 'none';
  }
}

// Function to fetch highscores based on selected date range
submitDateRange.onclick = function() {
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;

  if (!validateDates(startDate, endDate)) {
    alert('Please select valid start and end dates.');
    return;
  }

  dateModal.style.display = 'none'; // Close modal after date selection
  loadHighscores(startDate, endDate);
}

// Helper function to delay API calls (prevents too many requests at once)
const delay = ms => new Promise(res => setTimeout(res, ms));

// Function to validate start and end dates
function validateDates(startDate, endDate) {
  if (!startDate || !endDate) return false; // Dates should not be empty
  return new Date(startDate) <= new Date(endDate); // Start should be before or equal to end
}

// Function to fetch and load the highscores
async function loadHighscores(startDate, endDate) {
  loading = true;
  cancelLoading = false;
  updateButtonText("Stop Loading");

  await Promise.all([
    loadSkills(startDate, endDate),
    loadBosses(startDate, endDate),
    loadActivities(startDate, endDate)
  ]);

  if (!cancelLoading) {
    updateButtonText("Re-Load Highscores");
  }
  loading = false;
}

// Function to update button text
function updateButtonText(text) {
  const button = document.getElementById('loadHighscoresBtn');
  button.textContent = text;
}

// Modify the fetchWiseOldManData function to accept date range
async function fetchWiseOldManData(type, name, tableId, startDate, endDate) {
  if (cancelLoading) return;

  const url = `https://api.wiseoldman.net/v2/groups/4052/gained?metric=${name}&startDate=${startDate}&endDate=${endDate}&limit=3`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    const table = document.getElementById(tableId);
    const row = document.createElement('tr');
    const header = document.createElement('th');
    header.textContent = name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g, ' ');
    row.appendChild(header);

    data.forEach((player, index) => {
      const td = document.createElement('td');
      const rankEmoji = ["🥇", "🥈", "🥉"][index];
      const gained = player.data.gained === 0 ? "N/A" : `${rankEmoji} ${player.player.username} (${formatGainedValue(player.data.gained)})`;
      td.textContent = gained;
      row.appendChild(td);
    });

    table.appendChild(row);
  } catch (error) {
    console.error(`Error fetching ${type} data:`, error);
  }
}

// Updated functions to handle skills, bosses, and activities with date range
async function loadSkills(startDate, endDate) {
  const table = document.getElementById('skillsTable');
  table.innerHTML = ''; // Clear table before populating
  for (let i = 0; i < skills.length; i++) {
    await fetchWiseOldManData('skill', skills[i], 'skillsTable', startDate, endDate);
    await delay(100); // Respect API rate limits
    if (cancelLoading) break;
  }
}

async function loadBosses(startDate, endDate) {
  const table = document.getElementById('bossesTable');
  table.innerHTML = ''; // Clear table before populating
  for (let i = 0; i < bosses.length; i++) {
    await fetchWiseOldManData('boss', bosses[i], 'bossesTable', startDate, endDate);
    await delay(100); // Respect API rate limits
    if (cancelLoading) break;
  }
}

async function loadActivities(startDate, endDate) {
  const table = document.getElementById('activitiesTable');
  table.innerHTML = ''; // Clear table before populating
  for (let i = 0; i < activities.length; i++) {
    await fetchWiseOldManData('activity', activities[i], 'activitiesTable', startDate, endDate);
    await delay(100); // Respect API rate limits
    if (cancelLoading) break;
  }
}

// Helper function to format large XP values (e.g., 21576080 => 21576K, 11111 => 11.1K)
function formatGainedValue(value) {
  if (value >= 10000000) {
    return Math.floor value /10000) + 'M';
  } else if (value >= 100000) {
    return Math.floor(value / 1000) + 'K'; // No decimal for large values
  } else if (value >= 10000) {
    return (value / 1000).toFixed(1) + 'K'; // One decimal place for smaller values
  }
  return value; // Return the value as is if it's below 10,000
}

// Button click handler to toggle between loading and stopping
function handleButtonClick() {
  if (loading) {
    cancelLoading = true;
    updateButtonText("Re-Load Highscores");
  } else {
    dateModal.style.display = 'block'; // Show the date modal
  }
}

// Add event listener to the button
document.getElementById('loadHighscoresBtn').addEventListener('click', handleButtonClick);
