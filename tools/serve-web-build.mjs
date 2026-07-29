import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const buildDirectoryArgumentIndex = process.argv.indexOf('--build-dir');
const buildDirectoryName = buildDirectoryArgumentIndex >= 0
    ? process.argv[buildDirectoryArgumentIndex + 1]
    : 'web-mobile';
const buildRoot = path.join(projectRoot, 'build', buildDirectoryName);
const positionalPort = process.argv.slice(2).find((argument) => /^\d+$/.test(argument));
const port = Number(positionalPort || 8765);
const logRequests = process.argv.includes('--log-requests');
const mimeTypes = {
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.mp3': 'audio/mpeg',
    '.wasm': 'application/wasm',
};

if (!fs.existsSync(path.join(buildRoot, 'index.html'))) {
    throw new Error(`Web build not found: ${buildRoot}`);
}

const server = http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url || '/', 'http://127.0.0.1').pathname);
    if (logRequests) console.log(`${request.method || 'GET'} ${pathname}`);
    const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
    const filePath = path.resolve(buildRoot, relativePath);
    if (!filePath.startsWith(`${buildRoot}${path.sep}`) || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
        response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        response.end('Not found');
        return;
    }
    response.writeHead(200, {
        'Content-Type': mimeTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
        'Cache-Control': 'no-store',
    });
    fs.createReadStream(filePath).pipe(response);
});

server.listen(port, '127.0.0.1', () => {
    console.log(`Qv1.3 ${buildDirectoryName} preview: http://127.0.0.1:${port}/`);
});
