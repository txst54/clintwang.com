const fs = require('fs');
const path = require('path');

const SHADER_DIR = path.join(__dirname, 'src', 'shaders');
const OUTPUT_FILE = path.join(__dirname, 'src/components/hero/pathtracer', 'shaders.ts');

// Get all .vert.glsl and .frag.glsl files in shader directory
function getShaderFiles() {
    return fs.readdirSync(SHADER_DIR).filter(file =>
        file.endsWith('.vert.glsl') || file.endsWith('.frag.glsl')
    );
}

function getAllFiles(dir = SHADER_DIR, fileList = []) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            getAllFiles(fullPath, fileList); // Recurse into subdirectory
        } else if (entry.isFile() && fullPath.endsWith('.glsl')) {
            fileList.push(path.relative(SHADER_DIR, fullPath));
        }
    }

    return fileList;
}

// Extract macros from shader files using the new comment syntax
function extractMacros(files) {
    const macroMap = new Map();
    const beginRegex = /^\s*\/\/\s*begin_macro{([\w\d_]+)}/;
    const endRegex = /^\s*\/\/\s*end_macro/;

    for (const file of files) {
        const content = fs.readFileSync(path.join(SHADER_DIR, file), 'utf8');
        const lines = content.split('\n');
        let capturing = false;
        let currentMacro = '';
        let macroLines = [];

        for (const line of lines) {
            const beginMatch = line.match(beginRegex);
            const endMatch = line.match(endRegex);

            if (beginMatch) {
                if (capturing) throw new Error(`Nested macro in ${file}`);
                capturing = true;
                currentMacro = beginMatch[1];
                macroLines = [];
            } else if (endMatch) {
                if (!capturing) throw new Error(`Unmatched end_macro in ${file}`);
                if (macroMap.has(currentMacro)) {
                    throw new Error(`Duplicate macro "${currentMacro}" in ${file}`);
                }
                macroMap.set(currentMacro, macroLines.join('\n'));
                capturing = false;
                currentMacro = '';
            } else if (capturing) {
                macroLines.push(line);
            }
        }
    }

    return macroMap;
}

// Replace use_macro comments with actual macro text
function resolveMacros(source, macroMap, file) {
    const useRegex = /^\s*\/\/\s*use_macro{([\w\d_]+)}/gm;

    return source.replace(useRegex, (_, macroName) => {
        if (!macroMap.has(macroName)) {
            throw new Error(`Undefined macro "${macroName}" in file ${file}`);
        }
        return macroMap.get(macroName);
    });
}

// Format a TypeScript export
function makeExport(name, type, source) {
    return `export const ${name}${type}Text = \n\`${source}\n\`;`;
}

// Main generation logic
function buildShaders() {
    const files = getShaderFiles();
    const allFiles = getAllFiles();
    const macroMap = extractMacros(allFiles);

    const shaderGroups = {};

    for (const file of files) {
        const [shaderName, typeExt] = file.split('.');
        const type = typeExt === 'vert' ? 'VS' : 'FS';
        const content = fs.readFileSync(path.join(SHADER_DIR, file), 'utf8');
        const resolved = resolveMacros(content, macroMap, file);

        if (!shaderGroups[shaderName]) shaderGroups[shaderName] = {};
        shaderGroups[shaderName][type] = resolved;
    }

    const outputLines = [`// Auto-generated by glsl-parser.js\n`];

    for (const shaderName in shaderGroups) {
        const { FS, VS } = shaderGroups[shaderName];
        if (VS) outputLines.push(makeExport(shaderName, 'VS', VS));
        if (FS) outputLines.push(makeExport(shaderName, 'FS', FS));
    }

    fs.writeFileSync(OUTPUT_FILE, outputLines.join('\n\n'), 'utf8');
    console.log(`✅ Shaders.ts generated with ${Object.keys(shaderGroups).length} shader(s).`);
}

buildShaders();
