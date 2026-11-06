import * as http from 'node:http';
import * as fs from 'node:fs';
import * as path from 'node:path';
import type { AirlockConfig, ComplianceProofBundle } from '../types/index.js';
import { readJsonFile, readJsonlFile } from '../utils/files.js';
import { AttestationEngine } from '../compliance/attestation.js';
import { logger } from '../utils/logger.js';

export function startDashboardServer(config: AirlockConfig, port = 4100): http.Server {
  const complianceDir = config.compliance?.outputDir || './.airlock/compliance';
  const datasetFile = path.join(config.healer?.datasetDir || './.airlock/dataset', 'mutations.jsonl');
  const checkpointsDir = config.forker?.checkpointsDir || './.airlock/checkpoints';

  const server = http.createServer((req, res) => {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);

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

    // Serve Standalone HTML Report if available, else render dashboard UI
    const reportPath = path.join(complianceDir, 'compliance-report.html');
    if (url.pathname === '/' && fs.existsSync(reportPath)) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(fs.readFileSync(reportPath, 'utf8'));
      return;
    }

    // Fallback UI
    res.writeHead(200, { 'Content-Type': 'text/html' });
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
  <p>The Zero-Trust, Self-Compiling, Time-Traveling AI QA Engine</p>
  <div class="card">
    <h3>No Compliance Report Generated Yet</h3>
    <p>Run your first deterministic test with phantom egress interception:</p>
    <pre><code>npx airlock run</code></pre>
  </div>
</body>
</html>`);
  });

  server.listen(port, () => {
    logger.success(`AirlockQA Dashboard & Audit Viewer running at: http://localhost:${port}`);
  });

  return server;
}

