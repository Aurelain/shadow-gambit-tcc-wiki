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
