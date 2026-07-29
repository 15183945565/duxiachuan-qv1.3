import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

const projectRoot = path.resolve(import.meta.dirname, '..');
const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
const creatorVersion = packageJson.creator?.version;
const generatedConfig = path.join(projectRoot, 'temp', 'tsconfig.cocos.json');

function creatorTypeScriptCandidate(creatorPath) {
    if (!creatorPath) return '';
    const creatorRoot = path.extname(creatorPath).toLowerCase() === '.exe'
        ? path.dirname(creatorPath)
        : creatorPath;
    return path.join(
        creatorRoot,
        'resources',
        'app.asar.unpacked',
        'node_modules',
        'typescript',
        'lib',
        'tsc.js',
    );
}

const candidates = [
    process.env.COCOS_CREATOR_TYPESCRIPT,
    path.join(projectRoot, 'node_modules', 'typescript', 'lib', 'tsc.js'),
    creatorTypeScriptCandidate(process.env.COCOS_CREATOR_PATH),
    process.env.ProgramData && creatorVersion
        ? creatorTypeScriptCandidate(path.join(process.env.ProgramData, 'cocos', 'editors', 'Creator', creatorVersion))
        : '',
].filter(Boolean);

const tscPath = candidates.find((candidate) => fs.existsSync(candidate));
if (!tscPath) {
    console.error('TypeScript compiler not found.');
    console.error('Install project TypeScript or set COCOS_CREATOR_PATH / COCOS_CREATOR_TYPESCRIPT.');
    process.exit(1);
}

if (!fs.existsSync(generatedConfig)) {
    console.error(`Cocos generated TypeScript config missing: ${path.relative(projectRoot, generatedConfig)}`);
    console.error(`Open this project once with Cocos Creator ${creatorVersion || 'matching project version'}, then rerun check:type.`);
    process.exit(1);
}

const result = spawnSync(
    process.execPath,
    [
        tscPath,
        '--project',
        path.join(projectRoot, 'tsconfig.json'),
        '--noEmit',
        '--pretty',
        'false',
        '--skipLibCheck',
        'true',
    ],
    {
        cwd: projectRoot,
        encoding: 'utf8',
        stdio: 'pipe',
    },
);

if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);
if (result.error) {
    console.error(result.error);
    process.exit(1);
}
if (result.status !== 0) process.exit(result.status || 1);

console.log(`TypeScript check OK (Creator ${creatorVersion}, compiler ${path.relative(projectRoot, tscPath)})`);
