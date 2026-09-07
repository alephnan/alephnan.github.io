import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';

const root = resolve(process.env.SITE_ROOT || '.');
const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css',
  '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.pdf': 'application/pdf', '.txt': 'text/plain', '.xml': 'application/xml'
};

createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    let file = resolve(root, `.${pathname}`);
    if (file !== root && !file.startsWith(root + sep)) {
      response.writeHead(403).end();
      return;
    }
    const info = await stat(file).catch(() => null);
    if (info?.isDirectory()) {
      if (!pathname.endsWith('/')) {
        response.writeHead(301, { Location: `${pathname}/` }).end();
        return;
      }
      file = resolve(file, 'index.html');
    }
    const content = await readFile(file).catch(() => null);
    if (content) {
      response.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' });
      response.end(content);
    } else {
      response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      response.end(await readFile(resolve(root, '404.html')));
    }
  } catch {
    response.writeHead(400).end();
  }
}).listen(4173, '127.0.0.1');
