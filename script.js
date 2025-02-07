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
loadHighscoresBtn.onclick = function () {
    if (!loading) { // Open modal only if we're not already loading
        dateModal.style.display = 'block';
    }
}

// Close the modal
closeModal.onclick = function () {
    dateModal.style.display = 'none';
}

// Close the modal if the user clicks outside of it
window.onclick = function (event) {
    if (event.target == dateModal) {
        dateModal.style.display = 'none';
    }
}

// Function to fetch highscores based on selected date range
submitDateRange.onclick = function () {
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

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Ensure start date is strictly before end date
    if (start >= end) {
        // Option 1: Show error message to user
        alert('The start date must be before the end date.');
        return false;
    }

    return true;
}

// Function to fetch and load the highscores
async function loadHighscores(startDate, endDate) {
    loading = true;
    cancelLoading = false;
    updateButtonText("Stop Loading");

    // Load Skills
    await loadSkills(startDate, endDate);

    // Check if cancelLoading is true before continuing
    if (cancelLoading) {
        finishLoading();  // If loading is canceled, finish immediately
        return;
    }

    // Add a delay before loading Bosses
    await delay(1000); // 1 second delay

    // Load Bosses
    await loadBosses(startDate, endDate);

    // Check again if cancelLoading is true before continuing
    if (cancelLoading) {
        finishLoading();
        return;
    }

    // Add a delay before loading Activities
    await delay(1000); // 1 second delay

    // Load Activities
    await loadActivities(startDate, endDate);

    // Finish loading process if not canceled
    if (!cancelLoading) {
        finishLoading();  // Set everything back to normal after it's done
    }
}

// Function to update button text
function updateButtonText(text) {
    const button = document.getElementById('loadHighscoresBtn');
    button.textContent = text;
}

// Modify the fetchWiseOldManData function to use Axios and accept date range
async function fetchWiseOldManData(type, name, tableId, startDate, endDate) {
    if (cancelLoading) return;

    const url = `https://api.wiseoldman.net/v2/groups/4052/gained?metric=${name}&startDate=${startDate}&endDate=${endDate}&limit=3`;

    try {
        const response = await axios.get(url);
        const data = response.data;

        const table = document.getElementById(tableId);
        const row = document.createElement('tr');

        // Create a cell for the image and name
        const header = document.createElement('th');

        // Create the image element
        const img = document.createElement('img');
        img.src = `images/${name}.webp`;  // Assuming your images are stored in 'images/' directory
        img.alt = name;  // Accessibility: alt text set to the name of the metric
        img.classList.add('icon');  // Add a class for styling

        // Append the image and the text to the header
        header.appendChild(img);
        header.append(name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g, ' '));

        row.appendChild(header);

        data.forEach((player, index) => {
            const td = document.createElement('td');
            const rankEmoji = ["🥇", "🥈", "🥉"][index];

            const gained = player.data.gained === 0 ? "N/A" :
                `${rankEmoji} <span class="player-name">${player.player.username}</span> 
            (<span class="xp-gained">${formatGainedValue(player.data.gained)}</span>)`;

            td.innerHTML = gained; // Using innerHTML to apply styles to parts of the text
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

// Helper function to format large XP values (e.g., 21576080 => 22.64M, 11111 => 11.1K)
function formatGainedValue(value) {
    if (value >= 10000000) {
        return (value / 1000000).toFixed(2) + 'M'; // For values ≥ 10,000,000, use 'M' notation
    } else if (value >= 100000) {
        return Math.floor(value / 1000) + 'K'; // For values between 100,000 and 10,000,000, use whole 'K'
    } else if (value >= 10000) {
        return (value / 1000).toFixed(1) + 'K'; // For values between 10,000 and 100,000, use 1 decimal 'K'
    }
    return value; // Return the value as is if it's below 10,000
}

// Button click handler to toggle between loading and stopping
function handleButtonClick() {
    if (loading) {
        // Stop loading if it's in progress
        cancelLoading = true;
        updateButtonText("Re-Load Highscores");

        // Return early, do not open the date modal
        return;
    }

    // Only open modal if we are not in the process of stopping
    if (!loading && !cancelLoading) {
        dateModal.style.display = 'block'; // Open date modal
    }
}

// Add event listener to the button
document.getElementById('loadHighscoresBtn').addEventListener('click', handleButtonClick);

// Function to finish loading and reset state
function finishLoading() {
    loading = false;
    cancelLoading = false;
    updateButtonText("Re-Load Highscores");
}
