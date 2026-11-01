import app from './app.js';
import { connectDatabase } from './config/database.js';
import { env, validateEnv } from './config/env.js';

try {
  validateEnv();
  await connectDatabase();
  app.listen(env.port, '0.0.0.0', () => console.info(`AI Mystery Room API listening on port ${env.port}${env.demoMode ? ' (local demo mode)' : ''}`));
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
