import fs from 'fs';
import yaml from 'js-yaml';

/**
 *
 */
const readYamlFileAsJson = (yamlPath) => {
    const yamlMarkup = fs.readFileSync(yamlPath, 'utf8');
    const safeMarkup = yamlMarkup.replace(/[\s\S]*?MonoBehaviour:/, '');
    return yaml.load(safeMarkup);
};

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default readYamlFileAsJson;
