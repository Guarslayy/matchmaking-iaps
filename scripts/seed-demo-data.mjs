const baseUrl = process.env.API_BASE_URL ?? 'http://localhost:3000';
const names = ['Anna', 'Boris', 'Clara', 'David', 'Eva', 'Felix'];

async function createPlayer(name) {
  const response = await fetch(`${baseUrl}/players`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create player ${name}: ${response.status} ${await response.text()}`);
  }

  return response.json();
}

const created = [];
for (const name of names) {
  created.push(await createPlayer(name));
}

console.log(JSON.stringify({ created }, null, 2));
