import * as http from 'node:http';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { randomUUID } from 'node:crypto';
import { TLSSocket } from 'node:tls';
import { fileURLToPath } from 'node:url';
import type { AirlockConfig, ComplianceProofBundle } from '../types/index.js';
import { readJsonFile, readJsonlFile } from '../utils/files.js';
import { AttestationEngine } from '../compliance/attestation.js';
import { logger } from '../utils/logger.js';

const moduleDirectory = path.dirname(fileURLToPath(import.meta.url));
const publicDirectoryCandidates = [
  path.resolve(moduleDirectory, '../../public'),
  path.resolve(moduleDirectory, '../../../public'),
  path.resolve(process.cwd(), 'public'),
];
const publicDirectory = publicDirectoryCandidates.find((candidate) => fs.existsSync(candidate)) || publicDirectoryCandidates[0];

const staticContentTypes: Record<string, string> = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webm': 'video/webm',
};

const previewRecordingName = 'airlockqa-motion-preview.webm';
const maxPreviewRecordingBytes = 16 * 1024 * 1024;

function hasSameOrigin(req: http.IncomingMessage): boolean {
  const origin = req.headers.origin;
  const host = req.headers.host;
  if (!origin || !host) return false;

  try {
    const forwardedProtocol = req.headers['x-forwarded-proto'];
    const protocol = typeof forwardedProtocol === 'string'
      ? forwardedProtocol.split(',')[0].trim().toLowerCase()
      : req.socket instanceof TLSSocket ? 'https' : 'http';
    if (protocol !== 'http' && protocol !== 'https') return false;

    const originUrl = new URL(origin);
    const requestUrl = new URL(`${protocol}://${host}`);
    return !originUrl.username
      && !originUrl.password
      && !requestUrl.username
      && !requestUrl.password
      && originUrl.origin === requestUrl.origin
      && originUrl.pathname === '/'
      && !originUrl.search
      && !originUrl.hash;
  } catch {
    return false;
  }
}

export function startDashboardServer(
  config: AirlockConfig,
  port = 4100,
  artifactDirectory = path.resolve(process.cwd(), 'artifacts'),
): http.Server {
  const complianceDir = config.compliance?.outputDir || './.airlock/compliance';
  const datasetFile = path.join(config.healer?.datasetDir || './.airlock/dataset', 'mutations.jsonl');
  const checkpointsDir = config.forker?.checkpointsDir || './.airlock/checkpoints';

  const server = http.createServer((req, res) => {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);

    // Save the dashboard's short motion preview at one fixed local path.
    if (url.pathname === '/api/preview-recording') {
      const respond = (status: number, payload: Record<string, unknown>) => {
        if (res.writableEnded) return;
        res.writeHead(status, {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-store',
          'X-Content-Type-Options': 'nosniff',
        });
        res.end(JSON.stringify(payload));
      };

      if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        respond(405, { error: 'Method not allowed' });
        return;
      }
      if (!hasSameOrigin(req)) {
        respond(403, { error: 'Same-origin request required' });
        req.resume();
        return;
      }

      const contentType = req.headers['content-type']?.split(';', 1)[0].trim().toLowerCase();
      if (contentType !== 'video/webm') {
        respond(415, { error: 'Content-Type must be video/webm' });
        req.resume();
        return;
      }

      const declaredLength = Number(req.headers['content-length']);
      if (Number.isFinite(declaredLength) && declaredLength > maxPreviewRecordingBytes) {
        respond(413, { error: 'Recording exceeds the 16 MiB limit' });
        req.resume();
        return;
      }

      let receivedBytes = 0;
      let rejectedForSize = false;
      const chunks: Buffer[] = [];
      const onChunk = (chunk: Buffer) => {
        if (rejectedForSize) return;
        receivedBytes += chunk.length;
        if (receivedBytes > maxPreviewRecordingBytes) {
          rejectedForSize = true;
          chunks.length = 0;
          respond(413, { error: 'Recording exceeds the 16 MiB limit' });
          req.removeListener('data', onChunk);
          req.resume();
          return;
        }
        chunks.push(chunk);
      };
      req.on('data', onChunk);
      req.on('error', () => {
        chunks.length = 0;
        respond(400, { error: 'Unable to read recording body' });
      });
      req.on('end', () => {
        if (rejectedForSize || res.writableEnded) return;
        const recording = Buffer.concat(chunks, receivedBytes);
        const webmSignature = Buffer.from([0x1a, 0x45, 0xdf, 0xa3]);
        if (recording.length < webmSignature.length || !recording.subarray(0, webmSignature.length).equals(webmSignature)) {
          respond(400, { error: 'Body is not a WebM recording' });
          return;
        }

        void (async () => {
          const outputPath = path.join(artifactDirectory, previewRecordingName);
          const temporaryPath = path.join(artifactDirectory, `.airlockqa-preview-${randomUUID()}.tmp`);
          try {
            await fs.promises.mkdir(artifactDirectory, { recursive: true });
            await fs.promises.writeFile(temporaryPath, recording, { flag: 'wx' });
            await fs.promises.rename(temporaryPath, outputPath);
            respond(201, {
              path: path.relative(process.cwd(), outputPath).split(path.sep).join('/'),
              bytes: recording.length,
            });
          } catch {
            await fs.promises.unlink(temporaryPath).catch(() => undefined);
            respond(500, { error: 'Could not save preview recording' });
          }
        })();
      });
      return;
    }

    // API: Latest Attestation
    if (url.pathname === '/api/attestation') {
      const latestPath = path.join(complianceDir, 'latest-attestation.json');
      if (fs.existsSync(latestPath)) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(fs.readFileSync(latestPath, 'utf8'));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'No attestation bundle found. Run a test first.' }));
      }
      return;
    }

    // API: Compounding Mutations Dataset
    if (url.pathname === '/api/dataset') {
      const entries = readJsonlFile(datasetFile);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(entries));
      return;
    }

    // API: Checkpoints
    if (url.pathname === '/api/checkpoints') {
      if (fs.existsSync(checkpointsDir)) {
        const files = fs.readdirSync(checkpointsDir).filter((f) => f.endsWith('.json'));
        const checkpoints = files.map((f) => readJsonFile(path.join(checkpointsDir, f)));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(checkpoints));
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify([]));
      }
      return;
    }

    // API: Verify Bundle
    if (url.pathname === '/api/verify' && req.method === 'POST') {
      let body = '';
      req.on('data', (c) => (body += c));
      req.on('end', () => {
        try {
          const bundle = JSON.parse(body) as ComplianceProofBundle;
          const key = config.compliance?.signingKey || 'airlock-default-signing-key';
          const result = AttestationEngine.verifyBundle(bundle, key);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(result));
        } catch (err: any) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ valid: false, reason: err.message }));
        }
      });
      return;
    }

    // Keep the public marketing page at the root and expose the generated
    // compliance report at its own route when one is available.
    const reportPath = path.join(complianceDir, 'compliance-report.html');
    if (url.pathname === '/compliance-report' && fs.existsSync(reportPath)) {
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
      });
      res.end(req.method === 'HEAD' ? undefined : fs.readFileSync(reportPath, 'utf8'));
      return;
    }

    // Serve the public dashboard and its assets. Resolve decoded paths under
    // the public directory so URL-encoded traversal attempts cannot escape it.
    if (req.method === 'GET' || req.method === 'HEAD') {
      let decodedPath: string;
      try {
        decodedPath = decodeURIComponent(url.pathname);
      } catch {
        res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(req.method === 'HEAD' ? undefined : 'Bad request');
        return;
      }

      const normalizedRoute = decodedPath === '/' ? '/' : decodedPath.replace(/\/+$/, '') || '/';
      const publicRoutes: Record<string, string> = {
        '/': 'index.html',
        '/login': 'login.html',
        '/console': 'console.html',
      };
      const assetPath = publicRoutes[normalizedRoute]
        || decodedPath.replace(/^[/\\]+/, '').replace(/[\\]/g, path.sep);
      const filePath = path.resolve(publicDirectory, assetPath);
      const relativePath = path.relative(publicDirectory, filePath);
      if (relativePath === '..' || relativePath.startsWith(`..${path.sep}`) || path.isAbsolute(relativePath)) {
        res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(req.method === 'HEAD' ? undefined : 'Forbidden');
        return;
      }

      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const contentType = staticContentTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
        res.writeHead(200, {
          'Content-Type': contentType,
          'Cache-Control': 'no-cache',
          'X-Content-Type-Options': 'nosniff',
        });
        if (req.method === 'HEAD') {
          res.end();
        } else if (contentType.startsWith('text/') || contentType.startsWith('application/json')) {
          res.end(fs.readFileSync(filePath, 'utf8'));
        } else {
          res.end(fs.readFileSync(filePath));
        }
        return;
      }
    }

    if (url.pathname !== '/') {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(req.method === 'HEAD' ? undefined : 'Not found');
      return;
    }

    // Keep a small fallback for package installations that omit public assets.
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<!DOCTYPE html>
<html>
<head>
  <title>AirlockQA Console</title>
  <style>
    body { background: #090d16; color: #f3f4f6; font-family: sans-serif; padding: 2rem; }
    h1 { color: #06b6d4; }
    .card { background: #111827; border: 1px solid #1f2937; padding: 1.5rem; border-radius: 8px; margin-top: 1rem; }
    a { color: #06b6d4; }
  </style>
</head>
<body>
  <h1>🛡️ AirlockQA Interactive Console</h1>
  <p>Browser testing, request policy, and signed run evidence</p>
  <div class="card">
    <h3>No Run-Evidence Report Generated Yet</h3>
    <p>Run a Playwright test to create signed browser-run evidence:</p>
    <pre><code>npx airlock run</code></pre>
  </div>
</body>
</html>`);
  });

  server.listen(port, '127.0.0.1', () => {
    logger.success(`AirlockQA Dashboard & Run-Evidence Viewer running at: http://localhost:${port}`);
  });

  return server;
}

