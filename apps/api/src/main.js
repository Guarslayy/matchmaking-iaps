import { createAppServer } from './app.js';

const port = Number(process.env.PORT ?? 3000);
const server = createAppServer();

server.listen(port, () => {
  console.log(`API is running on http://localhost:${port}`);
});
