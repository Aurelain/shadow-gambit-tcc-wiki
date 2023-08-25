import * as url from 'url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

/**
 * The wiki url, pointing to /api.php
 */
export const ENDPOINT = 'https://shadowgambit.fandom.com/api.php';

/**
 * A file name (in the local OS file system) cannot contain some special characters, so we replace them.
 * Besides those, we're also replacing SPACE with UNDERSCORE.
 */
export const REPLACEMENTS = {
    '\\': '%5C',
    '/': '%2F',
    ':': '%3A',
    '*': '%2A', // Doesn't get encoded by `encodeURIComponent()`
    '?': '%3F',
    '"': '%22',
    '<': '%3C',
    '>': '%3E',
    '|': '%7C',
    ' ': '_', // Special treatment
};

/**
 * Installation directory, which should directly contain the Unity files.
 */
export const GAME_DIR = '';

/**
 * Directory where we store the downloaded pages.
 */
export const WIKI_DIR = __dirname + '../input/wiki';

/**
 * Directory where we store assets extracted (data-mined) from the game.
 */
export const DATAMINE_DIR = __dirname + '../input/game';

/**
 * Directory where we store the proposed wiki pages (which contain our suggestions).
 */
export const OUTPUT_DIR = __dirname + '../output';

/**
 * How many results the MediaWiki API should return for one request.
 */
export const API_LIMIT = 50;

/**
 * A flag for verbosity.
 */
export const DEBUG = true;

/**
 * Some badges don't require a dedicated page:
 */
export const GENERIC_BADGES = {
    badge_loc_generic_all_spawns: true, // Choose Your Landing
    badge_loc_generic_all_exits: true, // Back To the Marley
    badge_loc_generic_all_missions: true, // All Done
    badge_cha_generic_finish_mission: true, // Privateer
    badge_cha_generic_kill_ko: true, // Swashbuckler
    badge_cha_generic_visit_islands: true, // Explorer
    badge_mis_generic_finish_mission: true, // First Step
};

/**
 * TODO: get it from input\game\ExportedProject\Assets\MiSingletons\Addressables\MiVersion.asset
 */
export const GAME_VERSION = '1.0.70.r38399.f (2023-08-23)';
