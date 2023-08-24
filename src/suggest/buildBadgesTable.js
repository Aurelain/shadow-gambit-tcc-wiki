import attemptSelfRun from '../utils/attemptSelfRun.js';
import {DEBUG, OUTPUT_DIR} from '../CONFIG.js';
import fs from 'fs';
import open from 'open';
import readYamlFileAsJson from '../utils/readYamlFileAsJson.js';
import assert from 'assert/strict';
import isNumber from '../utils/isNumber.js';
import findFiles from '../utils/findFiles.js';
import isEmpty from '../utils/isEmpty.js';
import sortJson from '../utils/sortJson.js';
import {BADGES} from './BADGES.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
const buildBadgesTable = (minedList, hardcodedList) => {
    const output = [
        'Nr.', // index
        'Title',
        'Description',
        'Type',
        'Valid',
    ];

    const minedNames = {};
    for (const badge of minedList) {
        minedNames[badge.name] = badge._text;
    }

    for (let i = 0; i < hardcodedList.length; i++) {
        const badge = hardcodedList[i];
        const row = buildRow(badge, i + 1, minedNames);
        output.push(row);
    }
};

// =====================================================================================================================
//  P R I V A T E
// =====================================================================================================================
/**
 *
 */
const buildRow = (badge, nr, minedNames) => {
    const {name, loc, mis, crew, steps} = badge;
    const title = minedNames[badge.name];
    return [
        nr, // index
        title,
        description,
        type,
        valid,
    ];
};
// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default buildBadgesTable;
