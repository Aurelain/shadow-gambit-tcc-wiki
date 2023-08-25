import {DIFF_REPORT_DIR, ENDPOINT, OUTPUT_DIR, WIKI_DIR} from '../CONFIG.js';
import fsExtra from 'fs-extra';
import findFiles from '../utils/findFiles.js';
import open from 'open';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
const generateReport = () => {
    const outputPaths = findFiles(OUTPUT_DIR, /\.wiki$/);

    const list = [];
    for (const outputPath of outputPaths) {
        const fileName = outputPath.split('/').pop();
        const fileStem = fileName.replace(/.wiki$/, '');
        const inputPath = WIKI_DIR + '/' + fileName;
        const text1 = (fsExtra.pathExistsSync(inputPath) && fsExtra.readFileSync(inputPath, 'utf8')) || '';
        const text2 = fsExtra.readFileSync(outputPath, 'utf8');
        list.push({
            text1,
            text2,
            title: fileStem,
        });
    }

    const data = {
        wiki: ENDPOINT.replace(/[^\/]*$/, 'wiki'),
        list,
    };
    const dataBlob = 'window.DATA=' + JSON.stringify(data, null, 4) + ';';

    fsExtra.copySync(DIFF_REPORT_DIR, OUTPUT_DIR);
    const indexPath = OUTPUT_DIR + '/index.html';
    const indexContent = fsExtra.readFileSync(indexPath, 'utf8');
    const freshContent = indexContent.replace(/window.DATA[\s\S]*?;/, dataBlob);
    fsExtra.writeFileSync(indexPath, freshContent);

    open(OUTPUT_DIR + '/index.html');
};

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default generateReport;
