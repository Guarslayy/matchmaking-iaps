import { spawn } from 'node:child_process';
import process from 'node:process';

const baseUrl = 'http://localhost:3000';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(timeoutMs = 10000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(`${baseUrl}/`);
      if (response.ok) return;
    } catch {
      // keep polling
    }
    await sleep(250);
  }

  throw new Error('API server did not become ready in time');
}

async function post(path, body) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return { status: response.status, data };
}

async function get(path) {
  const response = await fetch(`${baseUrl}${path}`);
  const data = await response.json();
  return { status: response.status, data };
}

function printStep(title, payload) {
  console.log(`\n=== ${title} ===`);
  console.log(JSON.stringify(payload, null, 2));
}

async function runDemo() {
  const server = spawn(process.execPath, ['apps/api/src/main.js'], {
    cwd: process.cwd(),
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  server.stdout.on('data', (chunk) => {
    process.stdout.write(`[api] ${chunk}`);
  });
  server.stderr.on('data', (chunk) => {
    process.stderr.write(`[api] ${chunk}`);
  });

  try {
    await waitForServer();

    const created = [];
    for (const name of ['Anna', 'Boris', 'Clara', 'David', 'Eva', 'Felix']) {
      created.push((await post('/players', { name })).data);
    }
    printStep('Players created', created);

    printStep('Baseline enqueue', await post('/match/find', { playerId: created[0].id, algorithm: 'baseline' }));
    printStep('Baseline match', await post('/match/find', { playerId: created[1].id, algorithm: 'baseline' }));

    printStep('Greedy enqueue', await post('/match/find', { playerId: created[2].id, algorithm: 'greedy' }));
    printStep('Greedy match', await post('/match/find', { playerId: created[3].id, algorithm: 'greedy' }));

    printStep('Batch enqueue', await post('/match/find', { playerId: created[4].id, algorithm: 'batch_lite' }));
    printStep('Batch match', await post('/match/find', { playerId: created[5].id, algorithm: 'batch_lite' }));

    printStep('Profile #1', await get(`/players/${created[0].id}`));
    printStep('History #1', await get(`/players/${created[0].id}/history`));
    printStep('Baseline metrics', await get('/metrics?algorithm=baseline'));
    printStep('Greedy metrics', await get('/metrics?algorithm=greedy'));
    printStep('Batch metrics', await get('/metrics?algorithm=batch_lite'));
  } finally {
    server.kill('SIGTERM');
    await sleep(500);
  }
}

runDemo().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
